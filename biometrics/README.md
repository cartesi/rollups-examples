# Biometrics OpenCV DApp

This repository shows a OpenCV DApp applied to biometrics using cartesi rollups.

The DApp generates a [SVM](https://en.wikipedia.org/wiki/Support-vector_machine) model using [scikit-learn](https://scikit-learn.org/), [NumPy](https://numpy.org/) and [pandas](https://pandas.pydata.org/), and then uses [m2cgen (Model to Code Generator)](https://github.com/BayesWitnesses/m2cgen) to transpile that model into native Python code with no dependencies. This approach is inspired by [this Machine Learning tutorial](https://www.freecodecamp.org/news/transform-machine-learning-models-into-native-code-with-zero-dependencies/), and is useful for a Cartesi DApp because it removes the need of porting all those Machine Learning libraries to the Cartesi Machine's RISC-V architecture, making the development process easier and the final back-end code simpler to execute. Also, this DApp uses C++ OpenCV to generate the histograms for all images used in training and testing phase as well as for new images inputs.

The practical goal of this application is to predict a classification for Fingerprints. As such, users can submit images as inputs to classify as "Live" or "Fake". 

#Biometrics Workflow Explanation

This example uses a supervised approach to classify samples of fingerprints as lives and fakes. In doing so, the workflow used is the most default in this scenario: giving a classifier labeled inputs and then using the generated algorithm to classify a new input with a label. For this case, we area talking about binary classification, where the classifier will predict the inputs as one class or another (in this case as live or fake). The diagram bellow shows the workflow with every technology used in this experiment.


![bio drawio (2)](https://user-images.githubusercontent.com/4421825/172436514-10043ed8-1b92-4861-a39f-8c9aa41679fc.png)


The whole DApp uses C++ opencv and Python to achieve the main goal. It is a product of many researches applied with the Cartesi API.

## Requirements

Please refer to the [rollups-examples requirements](https://github.com/cartesi/rollups-examples/tree/main/README.md#requirements).

## Building

To run the biometrics example, clone the repository as follows:

```shell
$ git clone https://github.com/souzavinny/rollups-examples.git
```

The clone of this repository will give a sample dataset with the ideal structure for this experiment. Any change in it needs to be evaluated, but if the main structure fits the diagram bellow, it will work for any texture classification example:

![dataset drawio (2)](https://user-images.githubusercontent.com/4421825/172436480-a9043209-25b1-4de3-b769-465c5a4272e9.png)


You'll also need the risc-v toolchain from cartesi to cross compile the c++ code. You can see how to do that in this [article](https://medium.com/cartesi/guest-post-how-opencv-cross-compiles-in-the-blockchain-os-79a9eba6108b). We'll consider that you have it in /home/riscv/riscv64-cartesi-linux-gnu/. With that:

```shell
$ cd rollups-examples/biometrics/model/build_model_files
$ ./build_prod_model_files dataset
```


This command generates the files needed to train the model, and also builds the fexrvv to be used in the server folder. After that you construct the model with the command bellow.

```shell
$ cd rollups-examples/biometrics/model
$ make
```

This command takes the generated files from the step before and trains a model for be used in the back end, and also shows the scores for the trained model.

```shell
True Positive-->The classifier model predicted 162 Live(Positive) samples as Live(Positive)
False Negative-->The classifier model predicted 38 Live(Positive) samples as Fake(Negative)
True Positive-->The classifier model predicted 43 Fake(Negative) samples as Live(Positive)
True Negative-->The classifier model predicted 157 Fake(Negative) samples as Fake(Negative)
Precision of the Linear SVM: 0.7902439024390244
Recall of the Linear SVM: 0.81
Accuracy of the Linear SVM: 0.7975
Precision 0.7902439024390244
Recall 0.81
Accuracy 0.7975
```

With all the files needed ready, run the following command:

```shell
docker buildx bake -f docker-bake.hcl -f docker-bake.override.hcl --load
```

## Running

To start the application, execute the following command:

```shell
docker compose up
```

The application can afterwards be shut down with the following command:

```shell
docker compose down -v
```

## Understanding the application

As explained before, The DApp will receive a image as a input to classify as Live(genuine) finger or Fake(Spoof attack). 

When building the machine, the dataset is used as training data for building a Suport Vector Machine model. The model currently takes into the LBP histogram of characterists([See](https://en.wikipedia.org/wiki/Local_binary_patterns)). This generates a histogram to be used as features to classify.

The predicted classification result will be given as "Live" (Genuine Finger) or "Fake" (Spoof Attack).

## Interacting with the application

We can use the [frontend-console](../frontend-console) application to interact with the DApp.
Ensure that the [application has already been built](../frontend-console/README.md#building) before using it.

First, go to a separate terminal window and switch to the `frontend-console` directory:

```shell
cd frontend-console
```
Then, send an input using the python script in this folder, as follows:

```shell
$  python ./inputimg.py
Please Enter the image file
fake.png #We have two sample images in this folder, just pass the image name and extesion.
```

We strongly recommend to use that since input images are sent by turning them in strings base 64. But since the images are too long, they are divided in chunks to fit the size supported by the bash. Also, The backend expects a JSON with another informations generated by this script.

The input will have been accepted when you receive a response similar to the following one:

```shell
Image Sent!
Time Elapsed was: 38.65782713890076
Time per chunks was : 9.66445678472519
```


In order to verify the notices generated by your inputs, run the command:

```shell
yarn start notices
```

The response should be something like this:

```shell
[ { epoch: '0', input: '1', notice: '0', payload: 'Hello there' } ]
```

## Deploying to a testnet

Deploying the application to a blockchain requires creating a smart contract on that network, as well as running a validator node for the DApp.

The first step is to build the DApp's back-end machine, which will produce a hash that serves as a unique identifier.

```shell
docker buildx bake -f docker-bake.hcl -f docker-bake.override.hcl machine --load
```

Once the machine docker image is ready, we can use it to deploy a corresponding Rollups smart contract. This requires you to define a few environment variables to specify which network you are deploying to, which account to use, and which RPC gateway to use when submitting the deploy transaction.

```shell
export NETWORK=<network>
export MNEMONIC=<user sequence of twelve words>
export RPC_URL=<https://your.rpc.gateway>
```

For example, to deploy to the Goerli testnet using an Alchemy RPC node, you could execute:

```shell
export NETWORK=goerli
export MNEMONIC=<user sequence of twelve words>
export RPC_URL=https://eth-goerli.alchemyapi.io/v2/<USER_KEY>
```

With that in place, you can submit a deploy transaction to the Cartesi DApp Factory contract on the target network by executing the following command:

```shell
DAPP_NAME=biometrics docker compose -f ./deploy-testnet.yml up
```

This will create a file at `./deployments/<network>/biometrics.address` with the deployed contract's address.
Once the command finishes, it is advisable to stop the docker compose and remove the volumes created when executing it.

```shell
DAPP_NAME=biometrics docker compose -f ./deploy-testnet.yml down -v
```

After that, a corresponding Cartesi Validator Node must also be instantiated in order to interact with the deployed smart contract on the target network and handle the back-end logic of the DApp.
Aside from the environment variables defined above, the node will also need a secure websocket endpoint for the RPC gateway (WSS URL) and the chain ID of the target network.

For example, for Goerli and Alchemy, you would set the following additional variables:

```shell
export WSS_URL=wss://eth-goerli.alchemyapi.io/v2/<USER_KEY>
export CHAIN_ID=5
```

Then, the node itself can be started by running a docker compose as follows:

```shell
DAPP_NAME=mydapp docker compose -f ./docker-compose-testnet.yml -f ./docker-compose.override.yml up
```

## Interacting with the deployed application

With the node running, you can interact with the deployed DApp using the [frontend-console](https://github.com/cartesi/rollups-examples/tree/main/frontend-console), as described [previously](#interacting-with-the-application).
This time, however, you need to specify the appropriate connectivity configurations.

First of all, in the separate terminal for the frontend-console, define the `MNEMONIC` and `RPC_URL` variables as before:

```shell
export MNEMONIC=<user sequence of twelve words>
export RPC_URL=<https://your.rpc.gateway>
```

Then, inputs can be sent by specifying the DApp contract's address, as follows:

```shell
yarn start send --input "Hello there" --addressFile path/to/biometrics/deployments/<network>/biometrics.address
```

Resulting notices can then be retrieved by querying the local Cartesi Node, as before:

```shell
yarn start notices
```

## Running the back-end in host mode

When developing an application, it is often important to easily test and debug it. For that matter, it is possible to run the Cartesi Rollups environment in [host mode](https://github.com/cartesi/rollups-examples/tree/main/README.md#host-mode), so that the DApp's back-end can be executed directly on the host machine, allowing it to be debugged using regular development tools such as an IDE.

This DApp's back-end is written in Python, so to run it in your machine you need to have `python3` installed.

In order to start the back-end, run the following commands in a dedicated terminal:

```shell
python3 -m venv .env
. .env/bin/activate
pip install -r requirements.txt
ROLLUP_HTTP_SERVER_URL="http://127.0.0.1:5004" python3 biometrics.py
```

The final command will effectively run the back-end and send corresponding outputs to port `5004`.
It can optionally be configured in an IDE to allow interactive debugging using features like breakpoints.

You can also use a tool like [entr](https://eradman.com/entrproject/) to restart the back-end automatically when the code changes. For example:

```shell
ls *.py | ROLLUP_HTTP_SERVER_URL="http://127.0.0.1:5004" entr -r python3 biometrics.py
```

After the back-end successfully starts, it should print an output like the following:

```log
INFO:__main__:HTTP rollup_server url is http://127.0.0.1:5004
INFO:__main__:Sending finish
```

After that, you can interact with the application normally [as explained above](#interacting-with-the-application).
