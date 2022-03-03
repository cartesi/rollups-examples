# Make Predictions with k-nearest neighbors on the Iris Flowers Dataset

import json
import logging
import time
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

# Load a CSV file
def load_csv(filename):
    dataset = list()
    with open(filename, "r") as file:
        csv_reader = reader(file)
        for row in csv_reader:
            if not row:
                continue
            dataset.append(row)
    return dataset


# Convert string column to float
def str_column_to_float(dataset, column):
    for row in dataset:
        row[column] = float(row[column].strip())


# Convert string column to integer
def str_column_to_int(dataset, column):
    class_values = [row[column] for row in dataset]
    unique = set(class_values)
    lookup = dict()
    for i, value in enumerate(unique):
        lookup[value] = i
        print("[%s] => %d" % (value, i))
    for row in dataset:
        row[column] = lookup[row[column]]
    return lookup


# Find the min and max values for each column
def dataset_minmax(dataset):
    minmax = list()
    for i in range(len(dataset[0])):
        col_values = [row[i] for row in dataset]
        value_min = min(col_values)
        value_max = max(col_values)
        minmax.append([value_min, value_max])
    return minmax


# Rescale dataset columns to the range 0-1
def normalize_dataset(dataset, minmax):
    for row in dataset:
        for i in range(len(row)):
            row[i] = (row[i] - minmax[i][0]) / (minmax[i][1] - minmax[i][0])


# Calculate the Euclidean distance between two vectors
def euclidean_distance(row1, row2):
    distance = 0.0
    for i in range(len(row1) - 1):
        distance += (row1[i] - row2[i]) ** 2
    return sqrt(distance)


# Locate the most similar neighbors
def get_neighbors(train, test_row, num_neighbors):
    distances = list()
    for train_row in train:
        dist = euclidean_distance(test_row, train_row)
        distances.append((train_row, dist))
    distances.sort(key=lambda tup: tup[1])
    neighbors = list()
    for i in range(num_neighbors):
        neighbors.append(distances[i][0])
    return neighbors


# Make a prediction with neighbors
def predict_classification(train, test_row, num_neighbors):
    neighbors = get_neighbors(train, test_row, num_neighbors)
    output_values = [row[-1] for row in neighbors]
    prediction = max(set(output_values), key=output_values.count)
    return prediction


# Evaluate an algorithm using a cross validation split
def evaluate_algorithm(dataset, algorithm, n_folds, *args):
    folds = cross_validation_split(dataset, n_folds)
    scores = list()
    for fold in folds:
        train_set = list(folds)
        train_set.remove(fold)
        train_set = sum(train_set, [])
        test_set = list()
        for row in fold:
            row_copy = list(row)
            test_set.append(row_copy)
            row_copy[-1] = None
        predicted = algorithm(train_set, test_set, *args)
        actual = [row[-1] for row in fold]
        accuracy = accuracy_metric(actual, predicted)
        scores.append(accuracy)
    return scores


# Split a dataset into k folds
def cross_validation_split(dataset, n_folds):
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


# Calculate accuracy percentage
def accuracy_metric(actual, predicted):
    correct = 0
    for i in range(len(actual)):
        if actual[i] == predicted[i]:
            correct += 1
    return correct / float(len(actual)) * 100.0


# kNN Algorithm
def k_nearest_neighbors(train, test, num_neighbors):
    predictions = list()
    for row in test:
        output = predict_classification(train, row, num_neighbors)
        predictions.append(output)
    return predictions


# Cartesi Endpoint
@app.route("/advance", methods=["POST"])
def predict():
    # Make a prediction with KNN on Iris Dataset
    seed(1)
    app.logger.info("Loading model")
    filename = "iris.csv"
    dataset = load_csv(filename)
    for i in range(len(dataset[0]) - 1):
        str_column_to_float(dataset, i)
    # convert class column to integers
    str_column_to_int(dataset, len(dataset[0]) - 1)
    # define model parameter
    num_neighbors = 5
    # evaluate algorithm
    n_folds = 5
    num_neighbors = 5
    start = time.time()
    scores = evaluate_algorithm(dataset, k_nearest_neighbors, n_folds, num_neighbors)
    end = time.time()
    app.logger.info(
        "The time of execution of evaluation algorithm is :" + str(end - start)
    )

    app.logger.info("Current Scores for Knn: " + str(scores))
    app.logger.info(
        "Current Mean Accuracy for Knn in this dataset is : "
        + str((sum(scores) / float(len(scores))))
    )
    app.logger.info("Getting input")
    # get input
    body = request.get_json()
    app.logger.info(f"Received advance request body {body}")
    app.logger.info("Printing Body Payload : " + body["payload"])
    partial = body["payload"][2:]

    content = bytes.fromhex(partial).decode("utf-8")

    # json input should be like this {"sl": "2.0", "sw": "3.0", "pl": "4.0", "pw": "3.5"}
    s_json = json.loads(content)
    sl = float(s_json["sl"])
    app.logger.info("This should be the sepal lenght " + str(sl))
    sw = float(s_json["sw"])
    app.logger.info("This should be the sepal width " + str(sw))
    pl = float(s_json["pl"])
    app.logger.info("This should be the petal lenght " + str(pl))
    pw = float(s_json["pw"])
    app.logger.info("This should be the petal width " + str(pw))
        
    floats_list = [sl, sw, pl, pw]
    app.logger.info("The received input is: " + str(floats_list))

    start = time.time()
    predicted = str(predict_classification(dataset, floats_list, num_neighbors))
    end = time.time()
    app.logger.info("The time of execution of prediction is :" + str(end - start))
    app.logger.info(f"Data={content}, Predicted: {predicted}")

    # Encode back to Hex to add in the notice
    newpayload = "0x" + str(predicted.encode("utf-8").hex())
    app.logger.info("Predicted in Hex: " + newpayload)
    body["payload"] = newpayload
    app.logger.info("New PayLoad Added: " + body["payload"])
    app.logger.info("Adding notice")
    response = requests.post(
        dispatcher_url + "/notice", json={"payload": body["payload"]}
    )
    app.logger.info(
        f"Received notice status {response.status_code} body {response.content}"
    )
    app.logger.info("Finishing")
    response = requests.post(dispatcher_url + "/finish", json={"status": "accept"})
    app.logger.info(f"Received finish status {response.status_code}")
    return "", 202


@app.route("/inspect/<payload>", methods=["GET"])
def inspect(payload):
    app.logger.info(f"Received inspect request payload {payload}")
    return {"reports": [{"payload": payload}]}, 200
