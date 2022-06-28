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
from test.test_fixtures import ALICE, DEFAULT_ERC_20, DEFAULT_ERC_721

from auction.balance import Balance


class TestBalance(unittest.TestCase):

    def setUp(self) -> None:
        self.balance = Balance(ALICE)
        return super().setUp()

    def tearDown(self) -> None:
        del self.balance
        return super().tearDown()

    def test_erc20_get_no_balance(self):
        # Given there is no balance for an ERC-20 contract
        # When retrieving its balance
        # Then it returns 0
        result = self.balance.erc20_get(DEFAULT_ERC_20)

        self.assertEqual(result, 0)

    def test_erc20_get_with_balance(self):
        # Given there is balance for an ERC-20 contract
        # When retrieving its balance
        # Then it returns the amount of ERC-20 tokens from that contract
        self.balance = Balance(ALICE, erc20={DEFAULT_ERC_20: 1})

        result = self.balance.erc20_get(DEFAULT_ERC_20)

        self.assertEqual(result, 1)

    def test_erc20_get_with_multiple_contracts(self):
        # Given there is balance for multiple ERC-20 contracts
        # When retrieving the balance of an ERC-20 contract
        # Then it returns the amount of ERC-20 tokens from the requested contract
        balance1 = {DEFAULT_ERC_20: 1}
        balance2 = {"0xdeadbeef": 2}
        self.balance = Balance(ALICE, erc20=balance1 | balance2)

        result = self.balance.erc20_get(DEFAULT_ERC_20)

        self.assertEqual(result, 1)

    def test_erc20_increase_no_balance(self):
        # Given there is no balance for an ERC-20 contract
        # When increasing its balance by amount
        # Then its balance is created with amount tokens
        amount = 1

        self.balance._erc20_increase(DEFAULT_ERC_20, amount)

        result = self.balance.erc20_get(DEFAULT_ERC_20)
        self.assertEqual(result, amount)

    def test_erc20_increase_with_balance(self):
        # Given there is balance for an ERC-20 contract
        # When increasing its balance by amount
        # Then its balance becomes the old balance + amount
        amount = 1
        self.balance = Balance(ALICE, erc20={DEFAULT_ERC_20: 1})
        old_balance = self.balance.erc20_get(DEFAULT_ERC_20)

        self.balance._erc20_increase(DEFAULT_ERC_20, amount)

        new_balance = self.balance.erc20_get(DEFAULT_ERC_20)
        self.assertEqual(new_balance, old_balance + amount)

    def test_erc20_decrease_no_balance(self):
        # Given there is no balance for an ERC-20 contract
        # When decreasing its balance by amount
        # Then it raises a ValueError
        with self.assertRaises(ValueError):
            self.balance._erc20_decrease(DEFAULT_ERC_20, 1)

    def test_erc20_decrease_balance_zero(self):
        # Given the balance of an ERC-20 contract is 0
        # When decreasing its balance by amount
        # Then it raises a ValueError
        self.balance = Balance(ALICE, erc20={DEFAULT_ERC_20: 0})

        with self.assertRaises(ValueError):
            self.balance._erc20_decrease(DEFAULT_ERC_20, 1)

    def test_erc20_decrease_not_enough_balance(self):
        # Given there is balance for an ERC-20 contract
        # When decreasing its balance by a higher amount
        # Then it raises a ValueError
        self.balance = Balance(ALICE, erc20={DEFAULT_ERC_20: 1})

        with self.assertRaises(ValueError):
            self.balance._erc20_decrease(DEFAULT_ERC_20, 2)

    def test_erc20_decrease_with_enough_balance(self):
        # Given there is balance for an ERC-20 contract
        # When decreasing its balance by a smaller amount
        # Then its balance becomes the old balance - amount
        self.balance = Balance(ALICE, erc20={DEFAULT_ERC_20: 2})
        old_balance = self.balance.erc20_get(DEFAULT_ERC_20)

        self.balance._erc20_decrease(DEFAULT_ERC_20, 1)

        new_balance = self.balance.erc20_get(DEFAULT_ERC_20)
        self.assertEqual(new_balance, old_balance - 1)

    def test_erc721_get_no_balance(self):
        # Given there is no balance for an ERC-721 contract
        # When retrieving its balance
        # Then it returns an empty list
        tokens = self.balance.erc721_get(DEFAULT_ERC_721)

        self.assertEqual(len(tokens), 0)

    def test_erc721_get_with_balance(self):
        # Given there is balance for an ERC-721 contract
        # When retrieving its balance
        # Then it returns the ids of all owned tokens
        tokenId = 1
        self.balance = Balance(ALICE, erc721={DEFAULT_ERC_721: {tokenId}})

        tokens = self.balance.erc721_get(DEFAULT_ERC_721)

        self.assertIn(tokenId, tokens)

    def test_erc721_get_with_multiple_contracts(self):
        # Given there is balance for multiple ERC-721 contracts
        # When retrieving the balance of an ERC-721 contract
        # Then it returns the ids of all owned tokens from the requested contract
        balance1 = {DEFAULT_ERC_721: {1}}
        balance2 = {"0xdeadbeef": {2}}
        self.balance = Balance(ALICE, erc721=balance1 | balance2)

        tokens = self.balance.erc721_get(DEFAULT_ERC_721)

        self.assertIn(1, tokens)
        self.assertEqual(len(tokens), 1)

    def test_erc721_add_no_balance(self):
        # Given there is no balance for an ERC-721 contract
        # When adding an ERC-721 token
        # Then its balance is created containing the token
        tokenId = 1

        self.balance._erc721_add(DEFAULT_ERC_721, tokenId)

        tokens = self.balance.erc721_get(DEFAULT_ERC_721)
        self.assertIn(tokenId, tokens)

    def test_erc721_add_with_balance(self):
        # Given there is balance for an ERC-721 contract
        # When adding a new ERC-721 token
        # Then its balance also contains the new token's id
        token1 = 1
        token2 = 2
        self.balance = Balance(ALICE, erc721={DEFAULT_ERC_721: {token1}})

        self.balance._erc721_add(DEFAULT_ERC_721, token2)

        tokens = self.balance.erc721_get(DEFAULT_ERC_721)
        self.assertIn(token2, tokens)
        self.assertEqual(len(tokens), 2)

    def test_erc721_add_same_token(self):
        # Given the balance of an ERC-721 contract already has a token
        # When trying to add the same token
        # Then the balance for the ERC-721 contract is not changed
        tokenId = 1
        self.balance = Balance(ALICE, erc721={DEFAULT_ERC_721: {tokenId}})
        old_token_count = len(self.balance.erc721_get(DEFAULT_ERC_721))

        self.balance._erc721_add(DEFAULT_ERC_721, tokenId)

        new_token_count = len(self.balance.erc721_get(DEFAULT_ERC_721))
        self.assertEqual(old_token_count, new_token_count)
        self.assertEqual(new_token_count, 1)

    def test_erc721_remove_no_balance(self):
        # Given there is no balance for an ERC-721 contract
        # When removing a ERC-721 token
        # Then it raises a ValueError
        self.balance = Balance(ALICE, erc721={"0xdeadbeef": {1, 2}})
        token_count = len(self.balance.erc721_get("0xdeadbeef"))

        with self.assertRaises(ValueError):
            self.balance._erc721_remove(DEFAULT_ERC_721, 1)

    def test_erc721_remove(self):
        # Given there is balance for an ERC-721 contract
        # When removing a ERC-721 token with id tokenId
        # Then only token with id tokenId is removed from balance
        tokenId = 1
        self.balance = Balance(ALICE, erc721={DEFAULT_ERC_721: {tokenId, 2}})

        self.balance._erc721_remove(DEFAULT_ERC_721, tokenId)

        tokens = self.balance.erc721_get(DEFAULT_ERC_721)
        self.assertNotIn(tokenId, tokens)
        self.assertEqual(len(tokens), 1)

    def test_erc721_remove_with_multiple_contracts(self):
        # Given there is balance for multiple ERC-721 contracts
        # When removing a ERC-721 token from one of the contracts
        # Then it only removes the token from the requested contract
        balance1 = {DEFAULT_ERC_721: {1}}
        balance2 = {"0xdeadbeef": {2}}
        self.balance = Balance(ALICE, erc721=balance1 | balance2)

        self.balance._erc721_remove(DEFAULT_ERC_721, 1)

        contract1_tokens = self.balance.erc721_get(DEFAULT_ERC_721)
        contract2_tokens = self.balance.erc721_get("0xdeadbeef")
        self.assertEqual(len(contract1_tokens), 0)
        self.assertIn(2, contract2_tokens)

    def test_erc721_remove_wrong_token_id(self):
        # Given there is balance for an ERC-721 contract
        # When removing an unowned ERC-721 token
        # Then it raises a ValueError
        self.balance = Balance(ALICE, erc721={DEFAULT_ERC_721: {1}})
        token_count = len(self.balance.erc721_get(DEFAULT_ERC_721))

        with self.assertRaises(ValueError):
            self.balance._erc721_remove(DEFAULT_ERC_721, 2)


if __name__ == "__main__":
    unittest.main()
