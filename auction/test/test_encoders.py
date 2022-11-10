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

import json
import unittest
from test.test_fixtures import (ALICE, DEFAULT_ERC_20, DEFAULT_ERC_721,
                                DEFAULT_TOKEN_ID)
from test.test_model import BaseAuctionTestCase

from auction.balance import Balance
from auction.encoders import (AuctionEncoder, BalanceEncoder, BidEncoder,
                              ItemEncoder)
from auction.model import Bid, Item


class TestJSONEncoding(BaseAuctionTestCase):

    def test_item_encoding(self):
        encoder = ItemEncoder()
        item = Item(DEFAULT_ERC_721, DEFAULT_TOKEN_ID)
        expected = {
            "erc721": item.erc721,
            "token_id": item.token_id
        }

        item_json = encoder.encode(item)
        item_dict = json.loads(item_json)

        self.assertEqual(item_dict, expected)

    def test_bid_encoding(self):
        encoder = BidEncoder()
        bid = Bid(0, ALICE, 1, self.default_start_date)
        expected = {
            "auction_id": bid.auction_id,
            "author": bid.author,
            "amount": bid.amount,
            "timestamp": bid.timestamp.timestamp()
        }

        bid_json = encoder.encode(bid)
        bid_dict = json.loads(bid_json)

        self.assertEqual(bid_dict, expected)

    def test_balance_encoding(self):
        balance = Balance(ALICE,
                          erc20={DEFAULT_ERC_20: 10},
                          erc721={DEFAULT_ERC_721: {1, 2, 3}})
        encoder = BalanceEncoder()
        expected = {
            "erc20": balance._erc20,
            "erc721": {
                DEFAULT_ERC_721: [1, 2, 3]
            }
        }

        balance_json = encoder.encode(balance)
        balance_dict = json.loads(balance_json)

        self.assertEqual(balance_dict, expected)

    def test_auction_encoding(self):
        encoder = AuctionEncoder()
        expected = {
            "id": self.default_auction.id,
            "state": self.default_auction.state,
            "creator": self.default_auction.creator,
            "item": {
                "erc721": self.default_auction.item.erc721,
                "token_id": self.default_auction.item.token_id
            },
            "erc20": self.default_auction.erc20,
            "title": self.default_auction.title,
            "description": self.default_auction.description,
            "start_date": self.default_auction.start_date.timestamp(),
            "end_date": self.default_auction.end_date.timestamp(),
            "min_bid_amount": self.default_auction.min_bid_amount,
        }

        auction_json = encoder.encode(self.default_auction)
        auction_dict = json.loads(auction_json)

        self.assertEqual(auction_dict, expected)

    def test_auction_with_bid(self):
        encoder = AuctionEncoder()
        bid = Bid(self.default_auction.id, ALICE,
                  1, self.valid_bidding_date)
        self.default_auction.bid(bid)
        expected = {
            "id": self.default_auction.id,
            "state": self.default_auction.state,
            "creator": self.default_auction.creator,
            "item": {
                "erc721": self.default_auction.item.erc721,
                "token_id": self.default_auction.item.token_id
            },
            "erc20": self.default_auction.erc20,
            "title": self.default_auction.title,
            "description": self.default_auction.description,
            "start_date": self.default_auction.start_date.timestamp(),
            "end_date": self.default_auction.end_date.timestamp(),
            "min_bid_amount": self.default_auction.min_bid_amount,
        }

        auction_json = encoder.encode(self.default_auction)
        auction_dict = json.loads(auction_json)

        self.assertEqual(auction_dict, expected)


if __name__ == "__main__":
    unittest.main()
