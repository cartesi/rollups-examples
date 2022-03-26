# Copyright 2022 Cartesi Pte. Ltd.
#
# SPDX-License-Identifier: Apache-2.0
# Licensed under the Apache License, Version 2.0 (the "License"); you may not use
# this file except in compliance with the License. You may obtain a copy of the
# License at http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software distributed
# under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
# CONDITIONS OF ANY KIND, either express or implied. See the License for the
# specific language governing permissions and limitations under the License.

import pandas as pd
import m2cgen as m2c 
from sklearn.linear_model import LogisticRegression


#
# DEFINES TRAINING DATA AND ALGORITHM FOR BUILDING THE MODEL
#

# - model algorithm
model = LogisticRegression()

# - dataset for training the model
train_csv = "http://s3.amazonaws.com/assets.datacamp.com/course/Kaggle/train.csv"

# - dataset features to include in the model (use `None` to include everything)
include = ["Age", "Sex", "Embarked", "Survived"]

# - dataset feature to be predicted (dependent variable)
dependent_var = "Survived"



#
# READS AND PREPARES DATA
#

# - reads data into a pandas dataframe
train_df = pd.read_csv(train_csv)
if include:
     train_df = train_df[include]

# - pre-processes data to apply One Hot Encoding (OHE) and fill in absent values
independent_vars = train_df.columns.difference([dependent_var])
categoricals = []
for col, col_type in train_df[independent_vars].dtypes.iteritems():
     if col_type == 'O':
          # this is an object (categorical) type: will apply OHE to them
          # obs: OHE means that new columns will be created for every category/value combination
          categoricals.append(col)
     else:
          # for numerical types, fills in absent values with zeros
          # obs: this may not be ideal for certain numerical attributes, but is fine for Age
          train_df[col].fillna(0, inplace=True)
train_df_ohe = pd.get_dummies(train_df, columns=categoricals, dummy_na=True)



#
# BUILDS MODEL BY FITTING TRAIN DATA
#

x = train_df_ohe[train_df_ohe.columns.difference([dependent_var])]
y = train_df_ohe[dependent_var]
model.fit(x, y)



#
# EXPORTS MODEL
#

# - uses m2cgen to convert model to pure python code with zero dependencies
#   obs: generated Python code will define a method called `score(input)`, which computes
#        a numerical score based on an input list where each entry corresponds to one of
#        the model's input features/columns. If the dependent variable is a class with
#        more than 2 categories, then the output of the method will be a list of scores
#        for each category.
model_to_python = m2c.export_to_python(model)

# - gathers final model's input features/columns and possible output classes
model_columns = list(x.columns)
model_classes = train_df[dependent_var].unique().tolist()

# - writes model to file `model.py` in the parent directory (m2cgen/server)
with open("../model.py", "w") as text_file:
    print(f"{model_to_python}", file=text_file)
    print(f"columns = {model_columns}", file=text_file)
    print(f"classes = {model_classes}", file=text_file)

print("Model exported successfully")

