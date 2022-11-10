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

import unittest
from test.test_fixtures import (ALICE, BOB, DEFAULT_ERC_20, DEFAULT_ERC_721,
                                DEFAULT_TOKEN_ID)

import auction.wallet as wallet
from auction.balance import Balance
from auction.outputs import Error, Notice


class TestWallet(unittest.TestCase):

    def tearDown(self) -> None:
        wallet._accounts.clear()
        return super().tearDown()

    def test_erc20_transfer(self):
        # Given two accounts with ERC-20 tokens
        # When the first transfer an amount of tokens to the second
        # Then the balance of the first account is decreased by amount
        # And the balance of the second account is increased by amount
        amount = 1
        erc20 = DEFAULT_ERC_20
        wallet._accounts[ALICE] = Balance(ALICE, erc20={erc20: amount})
        wallet._accounts[BOB] = Balance(BOB, erc20={erc20: amount})

        alice_old_balance = wallet.balance_get(ALICE).erc20_get(erc20)
        bob_old_balance = wallet.balance_get(BOB).erc20_get(erc20)

        output = wallet.erc20_transfer(ALICE, BOB, erc20, amount)

        alice_current_balance = wallet.balance_get(ALICE).erc20_get(erc20)
        bob_current_balance = wallet.balance_get(BOB).erc20_get(erc20)
        self.assertEqual(type(output), Notice)
        self.assertEqual(alice_current_balance, alice_old_balance - amount)
        self.assertEqual(bob_current_balance, bob_old_balance + amount)

    def test_erc20_transfer_no_balance(self):
        # Given an account with no ERC-20 tokens
        # When it tries to transfer ERC-20 to another account
        # Then the transfer fails
        amount = 1
        erc20 = DEFAULT_ERC_20
        wallet._accounts[ALICE] = Balance(ALICE)
        wallet._accounts[BOB] = Balance(BOB)
        alice_old_balance = wallet.balance_get(ALICE).erc20_get(erc20)
        bob_old_balance = wallet.balance_get(BOB).erc20_get(erc20)

        output = wallet.erc20_transfer(ALICE, BOB, erc20, amount)

        alice_current_balance = wallet.balance_get(ALICE).erc20_get(erc20)
        bob_current_balance = wallet.balance_get(BOB).erc20_get(erc20)
        self.assertEqual(type(output), Error)
        self.assertEqual(alice_current_balance, alice_old_balance)
        self.assertEqual(bob_current_balance, bob_old_balance)

    def test_erc20_transfer_not_enough_funds(self):
        # Given an account with ERC-20 tokens
        # When it tries to transfer more ERC-20 tokens than it has
        # Then the transfer fails
        amount = 2
        erc20 = DEFAULT_ERC_20
        wallet._accounts[ALICE] = Balance(ALICE, {erc20: amount-1})
        wallet._accounts[BOB] = Balance(BOB)
        alice_old_balance = wallet.balance_get(ALICE).erc20_get(erc20)
        bob_old_balance = wallet.balance_get(BOB).erc20_get(erc20)

        output = wallet.erc20_transfer(ALICE, BOB, erc20, amount)

        alice_current_balance = wallet.balance_get(ALICE).erc20_get(erc20)
        bob_current_balance = wallet.balance_get(BOB).erc20_get(erc20)
        self.assertEqual(type(output), Error)
        self.assertEqual(alice_current_balance, alice_old_balance)
        self.assertEqual(bob_current_balance, bob_old_balance)

    def test_erc20_transfer_no_account(self):
        # Given there's no account
        # When it tries to transfer ERC-20 to another account
        # Then the transfer fails
        # And account is created
        wallet._accounts[BOB] = Balance(BOB)
        amount = 1
        erc20 = DEFAULT_ERC_20
        bob_old_balance = wallet.balance_get(BOB).erc20_get(erc20)

        output = wallet.erc20_transfer(ALICE, BOB, erc20, amount)

        bob_current_balance = wallet.balance_get(BOB).erc20_get(erc20)
        alice_current_balance = wallet.balance_get(ALICE).erc20_get(erc20)
        self.assertEqual(type(output), Error)
        self.assertEqual(bob_current_balance, bob_old_balance)
        self.assertEqual(alice_current_balance, 0)

    def test_erc721_transfer(self):
        # Given an account with a ERC-721 token
        # When it tries to transfer the token to a second account
        # Then the token moves from the first account to the second
        token_id = DEFAULT_TOKEN_ID
        erc721 = DEFAULT_ERC_721
        wallet._accounts[ALICE] = Balance(ALICE, erc721={erc721: {token_id}})
        wallet._accounts[BOB] = Balance(BOB)

        output = wallet.erc721_transfer(ALICE, BOB, erc721, token_id)

        alice_balance = wallet.balance_get(ALICE).erc721_get(erc721)
        bob_balance = wallet.balance_get(BOB).erc721_get(erc721)
        self.assertEqual(type(output), Notice)
        self.assertNotIn(token_id, alice_balance)
        self.assertIn(token_id, bob_balance)

    def test_erc721_transfer_no_balance(self):
        # Given an account with no ERC-721 token
        # When it tries to transfer a token to a second account
        # Then it returns a Error
        token_id = DEFAULT_TOKEN_ID
        erc721 = DEFAULT_ERC_721
        wallet._accounts[ALICE] = Balance(ALICE)
        wallet._accounts[BOB] = Balance(BOB)

        output = wallet.erc721_transfer(ALICE, BOB, erc721, token_id)

        alice_balance = wallet.balance_get(ALICE).erc721_get(erc721)
        bob_balance = wallet.balance_get(BOB).erc721_get(erc721)
        self.assertEqual(type(output), Error)
        self.assertNotIn(token_id, alice_balance)
        self.assertNotIn(token_id, bob_balance)

    def test_erc721_transfer_no_account(self):
        # Given there are no accounts
        # When it tries to transfer a token
        # Then it returns a Error
        token_id = DEFAULT_TOKEN_ID
        erc721 = DEFAULT_ERC_721

        output = wallet.erc721_transfer(ALICE, BOB, erc721, token_id)

        alice_balance = wallet.balance_get(ALICE).erc721_get(erc721)
        bob_balance = wallet.balance_get(BOB).erc721_get(erc721)

        self.assertEqual(type(output), Error)
        self.assertEqual(len(alice_balance), 0)
        self.assertEqual(len(bob_balance), 0)


if __name__ == "__main__":
    unittest.main()
