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

from copy import deepcopy


ALICE = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266"
BOB = "0x70997970c51812dc3a010c7d01b50e0d17dc79c8"
EVE = "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc"
DEFAULT_ERC_20 = "0x610178da211fef7d417bc0e6fed39f05609ad788"
DEFAULT_ERC_721 = "0x1613beb3b2c4f22ee086b2b38c1476a3ce7f78e8"
DEFAULT_TOKEN_ID = 1
DEFAULT_START_DATE = 1661888530

erc20_balance = {
    "erc20": {
        DEFAULT_ERC_20: 1
    }
}

erc721_balance = {
    "erc721": {
        DEFAULT_ERC_721: {DEFAULT_TOKEN_ID}
    }
}

full_balance = {
    "erc20": {
        DEFAULT_ERC_20: 1
    },
    "erc721": {
        DEFAULT_ERC_721: {DEFAULT_TOKEN_ID}
    }
}

balance_with_erc20 = {
    ALICE: deepcopy(erc20_balance)
}

balance_two_accounts_with_erc20 = {
    ALICE: deepcopy(erc20_balance),
    BOB: deepcopy(erc20_balance)
}

balance_with_erc721 = {
    ALICE: deepcopy(erc721_balance)
}

balance_two_accounts_alice_full_bob_with_erc20 = {
    ALICE: deepcopy(full_balance),
    BOB: deepcopy(erc20_balance)
}

balance_with_erc20_and_erc721 = {
    ALICE: deepcopy(full_balance)
}

balance_with_another_erc20 = {
    ALICE: {
        "erc20": {
            "0xdeadbeef": 1
        }
    }
}

balance_with_another_erc721 = {
    ALICE: {
        "erc721": {
            "0xdeadbeef": {DEFAULT_TOKEN_ID}
        }
    }
}
