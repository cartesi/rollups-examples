# Make Predictions with k-nearest neighbors on the Iris Flowers Dataset

import json
import logging
import traceback
from csv import reader
from math import sqrt
from os import environ
from random import randrange, seed

import requests
from flask import Flask, request

# Your API definition
app = Flask(__name__)
app.logger.setLevel(logging.INFO)

dispatcher_url = environ["HTTP_DISPATCHER_URL"]
app.logger.info(f"HTTP dispatcher url is {dispatcher_url}")


# k-NN model parameter: number of neighbors
num_neighbors = 5


def hex2str(hex):
    """
    Decodes a hex string into a regular string
    """
    return bytes.fromhex(hex[2:]).decode("utf-8")

def str2hex(str):
    """
    Encodes a string as a hex string
    """
    return "0x" + str.encode("utf-8").hex()


def load_csv(filename):
    """
    Loads a CSV file as a list of rows
    """
    dataset = list()
    with open(filename, "r") as file:
        csv_reader = reader(file)
        for row in csv_reader:
            if not row:
                continue
            dataset.append(row)
    return dataset

def dataset_str2float(dataset, column):
    """
    Converts a dataset column's values from string to float
    """
    for row in dataset:
        row[column] = float(row[column].strip())

def dataset_str2index(dataset, column):
    """
    Converts a dataset column's values from string to an integer class index
    """
    # retrieves class values from dataset column
    class_values = [row[column] for row in dataset]

    # computes existing class names based on values
    class_names = list(set(class_values))
    class_names.sort()

    # defines lookup dict class_name -> class_index
    lookup = dict()
    for i, name in enumerate(class_names):
        lookup[name] = i
    app.logger.info("Class mapping from dataset: " + str(lookup))

    # converts dataset column from class values (names) to class indices
    for row in dataset:
        row[column] = lookup[row[column]]

    return class_names


def euclidean_distance(row1, row2):
    """
    Calculates the Euclidean distance between two vectors/rows
    """
    distance = 0.0
    length = min(len(row1), len(row2))
    for i in range(length):
        distance += (row1[i] - row2[i]) ** 2
    return sqrt(distance)


def get_nearest_neighbors(dataset, input_row, num_neighbors):
    """
    Searches the given dataset to locate the most similar neighbors of the given input row
    """
    # computes distances to all dataset rows, generating tuples (row, distance)
    distances = list()
    for dataset_row in dataset:
        # computes distance disconsidering dataset_row's last value (its class)
        dist = euclidean_distance(input_row, dataset_row[:-1])
        distances.append((dataset_row, dist))

    # sorts entries using tuples' distance value
    distances.sort(key=lambda entry: entry[1])

    # returns neighbors list with the specified number of entries
    neighbors = list()
    for i in range(num_neighbors):
        neighbors.append(distances[i][0])
    return neighbors


def knn_classify(dataset, input_row, num_neighbors):
    """
    Predicts a given input row's classification using the k-nearest neighbors algorithm on the specified dataset
    """
    # retrieves the nearest neighbors
    neighbors = get_nearest_neighbors(dataset, input_row, num_neighbors)

    # computes the prediction by selecting the result with most entries within the nearest neighbors
    # obs: neighbor class is given by the last value in the row
    output_values = [row[-1] for row in neighbors]
    prediction = max(set(output_values), key=output_values.count)
    return prediction


def cross_validation_split(dataset, n_folds):
    """
    Splits a given dataset into n random folds for cross-validation
    """
    dataset_split = list()
    dataset_copy = list(dataset)
    fold_size = int(len(dataset) / n_folds)
    for _ in range(n_folds):
        fold = list()
        while len(fold) < fold_size:
            index = randrange(len(dataset_copy))
            fold.append(dataset_copy.pop(index))
        dataset_split.append(fold)
    return dataset_split

def accuracy_metric(actual, predicted):
    """
    Computes the accuracy percentage of a predicted classification when compared to the actual truth
    """
    correct = 0
    for i in range(len(actual)):
        if actual[i] == predicted[i]:
            correct += 1
    return correct / float(len(actual)) * 100.0

def evaluate_classification(dataset, classification_algorithm, n_folds, *args):
    """
    Evaluates a provided classification algorithm on a given dataset using cross-validation with n folds
    """
    # creates cross-validation folds
    folds = cross_validation_split(dataset, n_folds)

    fold_accuracies = list()
    for fold in folds:
        # defines train and test sets for the fold
        train_set = list(folds)
        train_set.remove(fold)
        train_set = sum(train_set, [])
        test_set = list()
        for row in fold:
            row_copy = list(row)
            test_set.append(row_copy)
            row_copy[-1] = None

        # runs the classification algorithm for the fold
        predicted = list()
        for row in test_set:
            output = classification_algorithm(train_set, row, num_neighbors)
            predicted.append(output)

        # evaluates the accuracy for the fold
        actual = [row[-1] for row in fold]
        accuracy = accuracy_metric(actual, predicted)
        fold_accuracies.append(accuracy)
    return fold_accuracies


def load_dataset():
    """
    Loads the Iris Dataset, evaluates the k-NN algorithm on it and computes classification accuracy
    """
    seed(1)

    # loads Iris dataset CSV file, ignoring the first line containing column names
    app.logger.info("Loading Iris Dataset")
    dataset = load_csv("iris.csv")[1:] 

    # converts value columns to float
    for i in range(len(dataset[0]) - 1):
        dataset_str2float(dataset, i)

    # converts class column to class indices
    class_names = dataset_str2index(dataset, len(dataset[0]) - 1)

    # evaluates knn algorithm for the dataset
    n_folds = 5
    fold_accuracies = evaluate_classification(dataset, knn_classify, n_folds, num_neighbors)
    app.logger.info("Accuracies for k-NN in each cross-validation fold: " + str(fold_accuracies))
    app.logger.info(
        "Mean accuracy for k-NN in the dataset: "
        + str((sum(fold_accuracies) / float(len(fold_accuracies))))
    )
    return (dataset, class_names)


@app.route("/advance", methods=["POST"])
def predict():
    body = request.get_json()
    app.logger.info(f"Received advance request body {body}")

    status = "accept"
    try:
        # retrieves input as string
        input = hex2str(body["payload"])
        app.logger.info(f"Received input: '{input}'")

        # json input should be like this {"sl": 2.0, "sw": 3.0, "pl": 4.0, "pw": 3.5}
        input_json = json.loads(input)
        input_row = [
            input_json["sl"],
            input_json["sw"],
            input_json["pl"],
            input_json["pw"]
        ]

        # computes predicted classification for input        
        predicted = knn_classify(dataset, input_row, num_neighbors)
        app.logger.info(f"Data={input}, Predicted: {predicted}")

        # emits output notice with predicted class name
        predicted_class_name = class_names[predicted]
        output = str2hex(predicted_class_name)
        app.logger.info(f"Adding notice with payload: {predicted_class_name}")
        response = requests.post(dispatcher_url + "/notice", json={"payload": output})
        app.logger.info(f"Received notice status {response.status_code} body {response.content}")

    except Exception as e:
        status = "reject"
        msg = f"Error processing body {body}\n{traceback.format_exc()}"
        app.logger.error(msg)
        response = requests.post(dispatcher_url + "/report", json={"payload": str2hex(msg)})
        app.logger.info(f"Received report status {response.status_code} body {response.content}")

    # finishes processing of the input
    app.logger.info("Finishing")
    response = requests.post(dispatcher_url + "/finish", json={"status": status})
    app.logger.info(f"Received finish status {response.status_code}")
    return "", 202


@app.route("/inspect/<payload>", methods=["GET"])
def inspect(payload):
    app.logger.info(f"Received inspect request payload {payload}")
    return {"reports": [{"payload": payload}]}, 200


# loads dataset and its class names
dataset, class_names = load_dataset()
