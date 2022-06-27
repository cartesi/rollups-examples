from sklearn.svm import LinearSVC
import argparse
from sklearn.metrics import confusion_matrix
from sklearn.metrics import accuracy_score
from sklearn.metrics import precision_score
from sklearn.metrics import recall_score
import m2cgen as m2c 
import numpy as np

def input_treatment(list):
    data = []
    for i in range(len(list)):
        list[i] = list[i].replace(';\n','')
        list[i] = list[i].replace('\n','')
        list[i] = list[i].replace('[','')
        list[i] = list[i].replace('[','')
        list[i] = list[i].replace(' ','')
        list[i] = np.fromstring(list[i], dtype=int, sep=',')
        #normalize histogram before adding to the list
        list[i] = list[i].astype("float")
        list[i] /= (list[i].sum() + eps)
        data.append(list[i])
    return data

# construct the argument parse and parse the arguments
ap = argparse.ArgumentParser()
ap.add_argument("-t", "--training", required=True, help="path to the training histograms file")
ap.add_argument("-e", "--testing", required=True,  help="path to the testing histograms file")
ap.add_argument("-tl", "--trainlabel", required=True,  help="path to the train labels file")
ap.add_argument("-tel", "--testlabel", required=True,  help="path to the test labels file")
args = vars(ap.parse_args())

# initalize de data lists
# the data and label lists
data = []
labels = []
eps=1e-7

data2 = []
labels2 = []

pridicted_label_set=[]
#Load C++ histograms
training_hists = open(args["training"], "r")
train = training_hists.readlines()

testing_hists = open(args["testing"], "r")
test = testing_hists.readlines()

#Load labels
training_labels = open(args["trainlabel"], "r")
labels = training_labels.readlines()
testing_labels = open(args["testlabel"], "r")
labels2 = testing_labels.readlines()
# train a Linear SVM on the data

#Turn input data to a list of np arrays.
data = input_treatment(train)

#organize train labels
for i in range(len(labels)):
    labels[i]=labels[i].replace('\n','')

model = LinearSVC(C=100.0, random_state=42, max_iter=10000)
model.fit(data, labels)

# convert model to pure python code  to be used in backend DApp.
model_to_python = m2c.export_to_python(model) 
with open("../model.py", "w") as text_file:
    print(f"{model_to_python}", file=text_file)

print("Model exported successfully")

#Turn input test data to a list of np arrays.
data2 = input_treatment(test)
#organize test labels
for i in range(len(labels2)):
    labels2[i]=labels2[i].replace('\n','')

# loop over the testing images
for hist in data2:
    prediction = model.predict(hist.reshape(1, -1))
    # store predicted labels in list
    pridicted_label_set.append(prediction[0])

# comparing predicted results(pridicted_label_set) and original results(labels2), and generating confusion matrix
con_matrix=confusion_matrix(labels2,pridicted_label_set,labels=["Live","Fake"])
TP=con_matrix[0][0]
FN=con_matrix[0][1]
FP=con_matrix[1][0]
TN=con_matrix[1][1]

print("True Positive-->The classifier model predicted "+str(TP)+" Live(Positive) samples as Live(Positive)")
print("False Negative-->The classifier model predicted "+str(FN)+" Live(Positive) samples as Fake(Negative)")
print("True Positive-->The classifier model predicted "+str(FP)+" Fake(Negative) samples as Live(Positive)")
print("True Negative-->The classifier model predicted "+str(TN)+" Fake(Negative) samples as Fake(Negative)")
print("Precision of the Linear SVM:", (TP / (TP+FP)))
print("Recall of the Linear SVM:", (TP / (TP+FN)))
print("Accuracy of the Linear SVM:", ((TP + TN) / (TP + TN + FP + FN)))


print("Precision",precision_score(labels2,pridicted_label_set,labels=["Live","Fake"],pos_label="Live"))
print("Recall",recall_score(labels2,pridicted_label_set,labels=["Live","Fake"],pos_label="Live"))
print("Accuracy",accuracy_score(labels2,pridicted_label_set))
