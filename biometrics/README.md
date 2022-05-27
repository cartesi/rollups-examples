# Biometrics OpenCV DApp

This repository shows a OpenCV DApp applied to biometrics using cartesi rollups.

The DApp generates a [SVM](https://en.wikipedia.org/wiki/Support-vector_machine) model using [scikit-learn](https://scikit-learn.org/), [NumPy](https://numpy.org/) and [pandas](https://pandas.pydata.org/), and then uses [m2cgen (Model to Code Generator)](https://github.com/BayesWitnesses/m2cgen) to transpile that model into native Python code with no dependencies. This approach is inspired by [this Machine Learning tutorial](https://www.freecodecamp.org/news/transform-machine-learning-models-into-native-code-with-zero-dependencies/), and is useful for a Cartesi DApp because it removes the need of porting all those Machine Learning libraries to the Cartesi Machine's RISC-V architecture, making the development process easier and the final back-end code simpler to execute. Also, this DApp uses C++ OpenCV to generate the histograms for all images used in training and testing phase as well as for new images inputs.

The practical goal of this application is to predict a classification for Fingerprints. As such, users can submit images as inputs to classify as "Live" or "Fake". 

## Building the environment

To run the biometrics example, clone the repository as follows:

```shell
$ git clone https://github.com/cartesi/rollups-examples.git
```

Before building, you will have to create a new rootfs file for the cartesi machine with OpenCV. For that, you will need to cross compile OpenCV for RISC-V and put inside of it. Or, you can just download a version that i've done myself [here](https://drive.google.com/file/d/1S_U4x7XZ4gOR4PIrZYoIvb1WnkDCrUWH/view?usp=sharing).

You'll also need the risc-v toolchain from cartesi to cross compile the c++ code. You can see how to do that in this [article](https://medium.com/cartesi/guest-post-how-opencv-cross-compiles-in-the-blockchain-os-79a9eba6108b). We'll consider that you have it in /home/riscv/riscv64-cartesi-linux-gnu/. With that:

```shell
$ cd rollups-examples/biometrics/server/model/build_model_files
$ ./build_prod_model_files dataset
```
This command generates the files needed to train the model, and also builds the fexrvv to be used in the server folder. After that you construct the model with the command bellow.

```shell
$ cd rollups-examples/biometrics/server/model
$ make

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

Then, build the back-end for the biometrics example:

```shell
$ cd rollups-examples/biometrics
$ make machine
```

## Running the environment

In order to start the containers in production mode, simply run:

```shell
$ docker-compose up --build
```

_Note:_ If you decide to use [Docker Compose V2](https://docs.docker.com/compose/cli-command/), make sure you set the [compatibility flag](https://docs.docker.com/compose/cli-command-compatibility/) when executing the command (e.g., `docker compose --compatibility up`).

Allow some time for the infrastructure to be ready.
How much will depend on your system, but after some time showing the error `"concurrent call in session"`, eventually the container logs will repeatedly show the following:

```shell
server_manager_1      | Received GetVersion
server_manager_1      | Received GetStatus
server_manager_1      |   default_rollups_id
server_manager_1      | Received GetSessionStatus for session default_rollups_id
server_manager_1      |   0
server_manager_1      | Received GetEpochStatus for session default_rollups_id epoch 0
```

To stop the containers, first end the process with `Ctrl + C`.
Then, remove the containers and associated volumes by executing:

```shell
$ docker-compose down -v
```

## Understanding the application

As explained before, The DApp will receive a image as a input to classify as Live(genuine) finger or Fake(Spoof attack). 

When building the machine, the dataset is used as training data for building a Suport Vector Machine model. The model currently takes into the LBP histogram of characterists([See](https://en.wikipedia.org/wiki/Local_binary_patterns)). This generates a histogram to be used as features to classify.

The predicted classification result will be given as "Live" (Genuine Finger) or "Fake" (Spoof Attack).

## Interacting with the application

With the infrastructure in place, you can interact with the application using a set of Hardhat tasks.

First, go to a separate terminal window, switch to the `biometrics/contracts` directory, and run `yarn`:

```shell
$ cd biometrics/contracts/
$ yarn
```

Then, send an input using the python script in this folder, as follows:

```shell
$  python ./inputimg.py
Please Enter the image file
fake.png #We have two sample images in this folder, is just pass the image name and extesion.
```

We strongly recommend to use that since input images are sent by turning them in strings base 64. But since the images are too long, they are divided in chunks to fit the size supported by the bash. 

The input will have been accepted when you receive a response similar to the following one:

```shell
Image Sent!
Time Elapsed was: 38.65782713890076
Time per chunks was : 9.66445678472519
```

In order to verify the notices generated by your inputs, run the command:

```shell
$ npx hardhat --network localhost biometrics:getNotices --epoch 0 --payload string
```

The response should be something like this:

```shell
{"session_id":"default_rollups_id","epoch_index":"0","input_index":"0","notice_index":"0","payload":"0"}
```

Where the payload corresponds to whether the finger is "Live" or "Fake"

## Advancing time

To advance time, in order to simulate the passing of epochs, run:

```shell
$ npx hardhat --network localhost util:advanceTime --seconds 864010
```

## Running the environment in host mode

When developing an application, it is often important to easily test and debug it. For that matter, it is possible to run the Cartesi Rollups environment in [host mode](../README.md#host-mode), so that the DApp's back-end can be executed directly on the host machine, allowing it to be debugged using regular development tools such as an IDE.

The first step is to run the environment in host mode using the following command:

```shell
$ docker-compose -f docker-compose.yml -f docker-compose-host.yml up --build
```

The next step is to run the biometrics server in your machine. The application is written in Python, so you need to have `python3` installed.

In order to start the m2cgen server, run the following commands in a dedicated terminal:

```shell
$ cd biometrics/server/
$ python3 -m venv .env
$ . .env/bin/activate
$ pip install -r requirements.txt
$ ROLLUP_HTTP_SERVER_URL="http://127.0.0.1:5004" python3 biometrics.py
```

This will run the m2cgen server and send the corresponding notices to port `5004`.

The final command, which effectively starts the server, can also be configured in an IDE to allow interactive debugging using features like breakpoints.
You can also use a tool like [entr](https://eradman.com/entrproject/) to restart it automatically when the code changes. For example:

```shell
$ ls *.py | ROLLUP_HTTP_SERVER_URL="http://127.0.0.1:5004" entr -r python3 biometrics.py
```

After the server successfully starts, it should print an output like the following:

```
INFO:__main__:HTTP rollup_server url is http://127.0.0.1:5004
INFO:__main__:Sending finish
```

After that, you can interact with the application normally [as explained above](#interacting-with-the-application).

When you add an input, you should see it being processed by the biometrics server as follows:

```log
INFO:__main__:Received finish status 200
INFO:__main__:Received advance request data {'metadata': {'msg_sender': '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266', 'epoch_index': 0, 'input_index': 0, 'block_number': 0, 'timestamp': 0}, 'payload': '0x7b22416765223a2033372c2022536578223a20226d616c65222c2022456d6261726b6564223a202253227d'}
INFO:__main__:Received input: '{"Age": 37, "Sex": "male", "Embarked": "S"}'
INFO:__main__:Data={"Age": 37, "Sex": "male", "Embarked": "S"}, Predicted: 0
INFO:__main__:Adding notice with payload: 0
INFO:__main__:Received notice status 200 body b'{"index":0}'
INFO:__main__:Sending finish
```

Finally, to stop the containers, removing any associated volumes, execute:

```shell
$ docker-compose -f docker-compose.yml -f docker-compose-host.yml down -v
```
