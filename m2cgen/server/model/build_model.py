# Import dependencies
import pandas as pd
import numpy as np
from sklearn.linear_model import LogisticRegression
import m2cgen as m2c 

# Load the dataset in a dataframe object and include only four features as mentioned
url = "http://s3.amazonaws.com/assets.datacamp.com/course/Kaggle/train.csv"
# url = "iris.csv"

include = ['Age', 'Sex', 'Embarked', 'Survived'] # Only four features
# include = None

dependent_var = 'Survived'
# dependent_var = 'species'

df = pd.read_csv(url)
if include:
     df_ = df[include]
else:
     df_ = df

independent_vars = df_.columns.difference([dependent_var])

# Data Preprocessing
categoricals = []
for col, col_type in df_[independent_vars].dtypes.iteritems():
     if col_type == 'O':
          categoricals.append(col)
     else:
          df_[col].fillna(0, inplace=True)

df_ohe = pd.get_dummies(df_, columns=categoricals, dummy_na=True)

# Logistic Regression classifier

x = df_ohe[df_ohe.columns.difference([dependent_var])]
y = df_ohe[dependent_var]
lr = LogisticRegression()
lr.fit(x, y)

# Save your model
model_to_python = m2c.export_to_python(lr)
model_columns = list(x.columns)
model_classes = df_[dependent_var].unique().tolist()
print("Model Generated! Use this into your file inside Cartesi Machine")
with open("../model.py", "w") as text_file:
    print(f"{model_to_python}", file=text_file)
    print(f"columns = {model_columns}", file=text_file)
    print(f"classes = {model_classes}", file=text_file)


