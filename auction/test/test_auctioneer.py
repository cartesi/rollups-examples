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
from copy import copy
from datetime import timedelta
from test.test_fixtures import *
from test.test_model import BaseAuctionTestCase

import auction.wallet as wallet
from auction.auctioneer import Auctioneer
from auction.balance import Balance
from auction.model import Auction, Item
from auction.outputs import Error, Notice, Voucher
from auction.util import hex_to_str


class BaseAuctioneerTest(BaseAuctionTestCase):

    def setUp(self):
        super().setUp()

        self.auctioneer = Auctioneer(wallet)
        self.auction_creation_date = self.default_start_date - \
            timedelta(minutes=1)

    def tearDown(self):
        self.auctioneer._auctions.clear()
        del self.auctioneer

        return super().tearDown()


class TestAuctionCreation(BaseAuctioneerTest):

    def test_create_auction_without_balance(self):
        # Given seller doesn't possess balance
        # When he tries to create an auction
        # Then auction isn't created and an Error is returned
        auction_count = len(self.auctioneer._auctions)
        output = self.auctioneer.auction_create(
            title="title",
            description="description",
            start_date=self.default_start_date,
            end_date=self.default_end_date,
            erc20=DEFAULT_ERC_20,
            item=self.default_item,
            min_bid_amount=1,
            seller=BOB,
            current_date=self.auction_creation_date)

        self.assertIs(type(output), Error)
        self.assertEqual(auction_count, len(self.auctioneer._auctions))

    def test_create_auction_without_possessing_item(self):
        # Given seller doesn't possess item
        # When he tries to create an auction
        # Then auction isn't created and an Error is returned
        wallet._accounts[ALICE] = Balance(ALICE)
        auction_count = len(self.auctioneer._auctions)

        output = self.auctioneer.auction_create(
            title="title",
            description="description",
            start_date=self.default_start_date,
            end_date=self.default_end_date,
            erc20=DEFAULT_ERC_20,
            item=self.default_item,
            min_bid_amount=1,
            seller=BOB,
            current_date=self.auction_creation_date)

        self.assertIs(type(output), Error)
        self.assertEqual(auction_count, len(self.auctioneer._auctions))

    def test_create_auction_with_invalid_start_date(self):
        # Given start date predates the input creation
        # When trying to create an auction
        # Then auction isn't created and an Error is returned
        wallet._accounts[ALICE] = Balance(ALICE, erc721={DEFAULT_ERC_721: {1}})
        auction_count = len(self.auctioneer._auctions)
        invalid_start_date = self.auction_creation_date - timedelta(seconds=1)

        output = self.auctioneer.auction_create(
            title="title",
            description="description",
            start_date=invalid_start_date,
            end_date=self.default_end_date,
            erc20=DEFAULT_ERC_20,
            item=self.default_item,
            min_bid_amount=1,
            seller=ALICE,
            current_date=self.auction_creation_date)

        self.assertIs(type(output), Error)
        self.assertEqual(auction_count, len(self.auctioneer._auctions))

    def test_create_auction_with_balance(self):
        # Given seller owns the item
        # When he tries to create an auction
        # Then auction is created and a Notice is returned
        wallet._accounts[ALICE] = Balance(ALICE, erc721={
            self.default_item.erc721: {self.default_item.token_id}})
        expected_auction_count = 1

        output = self.auctioneer.auction_create(
            title="title",
            description="description",
            start_date=self.default_start_date,
            end_date=self.default_end_date,
            erc20=DEFAULT_ERC_20,
            item=self.default_item,
            min_bid_amount=1,
            seller=ALICE,
            current_date=self.auction_creation_date)

        self.assertIs(type(output), Notice)
        self.assertEqual(expected_auction_count,
                         len(self.auctioneer._auctions))


class TestBidding(BaseAuctioneerTest):

    def setUp(self):
        super().setUp()
        id = self.default_auction.id
        self.auctioneer._auctions[id] = self.default_auction

    def tearDown(self):
        super().tearDown()
        wallet._accounts.clear()

    def test_bid_invalid_auction_id(self):
        # Given a bid arrives for a nonexisting auction
        # When trying to bid
        # It fails and generates an Error
        wallet._accounts[ALICE] = Balance(ALICE, erc20={DEFAULT_ERC_20: 1})
        expected_bids = self.default_auction.bids

        output = self.auctioneer.auction_bid(
            ALICE, 9999, 1, self.valid_bidding_date)
        bids = self.auctioneer._auctions[self.default_auction.id].bids

        self.assertIs(type(output), Error)
        self.assertEqual(len(bids), len(expected_bids))

    def test_bid_before_auction_starts(self):
        # Given bid arrives before auction start
        # When trying to bid
        # It fails and generates an Error
        invalid_date = self.default_auction.start_date - timedelta(hours=1)
        expected_bids = self.default_auction.bids

        output = self.auctioneer.auction_bid(ALICE, 0, 1, invalid_date)
        bids = self.auctioneer._auctions[self.default_auction.id].bids

        self.assertIs(type(output), Error)
        self.assertEqual(len(bids), len(expected_bids))

    def test_bid_after_auction_ends(self):
        # Given bid arrives after auction ends
        # When trying to bid
        # It fails and generates an Error
        wallet._accounts[ALICE] = Balance(ALICE, erc20={DEFAULT_ERC_20: 1})
        invalid_date = self.default_auction.end_date + timedelta(hours=1)
        expected_bids = self.default_auction.bids

        output = self.auctioneer.auction_bid(ALICE, 0, 1, invalid_date)
        bids = self.auctioneer._auctions[self.default_auction.id].bids

        self.assertIs(type(output), Error)
        self.assertEqual(len(bids), len(expected_bids))

    def test_bid_not_enough_funds(self):
        # Given bidder doesn't have enough funds to bid
        # When trying to bid
        # It fails and generates an Error
        wallet._accounts[BOB] = Balance(BOB, erc20={DEFAULT_ERC_20: 1})
        expected_bids = self.default_auction.bids

        output = self.auctioneer.auction_bid(
            BOB, 0, 2, self.valid_bidding_date)
        bids = self.auctioneer._auctions[self.default_auction.id].bids

        self.assertIs(type(output), Error)
        self.assertEqual(len(bids), len(expected_bids))

    def test_bid_with_enough_funds(self):
        # Given bidder has enough funds to bid
        # When trying to bid
        # It succeeds and generates a Notice
        wallet._accounts[BOB] = Balance(BOB, erc20={DEFAULT_ERC_20: 1})
        expected_bids = self.default_auction.bids

        output = self.auctioneer.auction_bid(
            BOB, 0, 1, self.valid_bidding_date)
        bids = self.auctioneer._auctions[self.default_auction.id].bids

        self.assertIs(type(output), Notice)
        self.assertEqual(len(bids), len(expected_bids))

    def test_bid_wallet_not_initialized(self):
        # Given no deposit has been performed
        # When trying to bid
        # It fails and generates an Error
        output = self.auctioneer.auction_bid(
            ALICE, 0, 1, self.valid_bidding_date)

        self.assertIs(type(output), Error)

    def test_bid_bidder_owns_auction(self):
        # Given bidder has created the auction
        # When trying to bid
        # It fails and generates an Error
        output = self.auctioneer.auction_bid(
            ALICE, 0, 1, self.valid_bidding_date)
        bids = self.auctioneer._auctions[self.default_auction.id].bids

        self.assertIs(type(output), Error)
        self.assertEqual(len(bids), 0)


class TestAuctionEnd(BaseAuctioneerTest):

    def setUp(self):
        super().setUp()
        id = self.default_auction.id
        self.auctioneer._auctions[id] = self.default_auction

    def test_end_auction_before_date(self):
        wallet._accounts[ALICE] = Balance(ALICE, erc20={DEFAULT_ERC_20: 1})
        wrong_date = self.default_end_date - timedelta(minutes=1)

        output = self.auctioneer.auction_end(
            auction_id=self.default_auction.id,
            rollup_address=EVE,
            msg_date=wrong_date,
            msg_sender=ALICE)

        self.assertIs(type(output), Error)

    def test_end_nonexisting_auction(self):
        wallet._accounts[ALICE] = Balance(ALICE, erc20={DEFAULT_ERC_20: 1})
        valid_end_date = self.default_end_date + timedelta(minutes=1)

        output = self.auctioneer.auction_end(
            auction_id=-1,
            rollup_address=EVE,
            msg_date=valid_end_date,
            msg_sender=ALICE)

        self.assertIs(type(output), Error)

    def test_end_auction_without_bids(self):
        wallet._accounts[ALICE] = Balance(ALICE, erc20={DEFAULT_ERC_20: 1})
        valid_end_date = self.default_end_date + timedelta(minutes=1)

        outputs = self.auctioneer.auction_end(
            auction_id=self.default_auction.id,
            rollup_address=EVE,
            msg_date=valid_end_date,
            msg_sender=ALICE,
            withdraw=False)

        self.assertIsNot(type(outputs), Error)
        self.assertEqual(self.default_auction.state, Auction.FINISHED)
        self.assertEqual(1, len(outputs))
        self.assertEqual(type(outputs[0]), Notice)

    def test_end_auction_without_withdrawing_nft(self):
        wallet._accounts[ALICE] = Balance(ALICE, erc721={DEFAULT_ERC_721: {1}})
        wallet._accounts[BOB] = Balance(BOB, erc20={DEFAULT_ERC_20: 1})
        valid_end_date = self.default_end_date + timedelta(minutes=1)
        valid_bid_date = self.default_end_date - timedelta(minutes=1)
        self.auctioneer.auction_bid(
            bidder=BOB,
            auction_id=self.default_auction.id,
            amount=1,
            timestamp=valid_bid_date)

        outputs = self.auctioneer.auction_end(
            auction_id=self.default_auction.id,
            rollup_address=EVE,
            msg_date=valid_end_date,
            msg_sender=BOB,
            withdraw=False)

        self.assertIsNot(type(outputs), Error)
        self.assertEqual(self.default_auction.state, Auction.FINISHED)
        self.assertEqual(3, len(outputs))
        for output in outputs:
            self.assertEqual(type(output), Notice)

    def test_end_auction_withdrawing_nft(self):
        wallet._accounts[ALICE] = Balance(ALICE, erc721={DEFAULT_ERC_721: {1}})
        wallet._accounts[BOB] = Balance(BOB, erc20={DEFAULT_ERC_20: 1})
        valid_end_date = self.default_end_date + timedelta(minutes=1)
        valid_bid_date = self.default_end_date - timedelta(minutes=1)
        self.auctioneer.auction_bid(
            bidder=BOB,
            auction_id=self.default_auction.id,
            amount=1,
            timestamp=valid_bid_date)

        outputs = self.auctioneer.auction_end(
            auction_id=self.default_auction.id,
            rollup_address=EVE,
            msg_date=valid_end_date,
            msg_sender=BOB,
            withdraw=True)

        self.assertIsNot(type(outputs), Error)
        self.assertEqual(self.default_auction.state, Auction.FINISHED)
        self.assertEqual(4, len(outputs))
        types = map(lambda x: type(x), outputs)
        self.assertIn(Voucher, types)


class TestAuctionListing(BaseAuctionTestCase):

    def setUp(self):
        super().setUp()
        self.auctioneer = Auctioneer(wallet)
        self.auction_creation_date = self.default_start_date - \
            timedelta(minutes=1)

        wallet._accounts[ALICE] = Balance(
            ALICE, erc721={DEFAULT_ERC_721: {0, 1, 2, 3, 4, 5, 6, 7, 8, 9}})
        erc721_balance = wallet.balance_get(ALICE).erc721_get(DEFAULT_ERC_721)
        self.available_ids = sorted(erc721_balance)
        self.create_auctions()

    def tearDown(self):
        self.auctioneer._auctions.clear()
        del self.auctioneer
        del self.available_ids
        return super().tearDown()

    def create_auctions(self):
        # Save the initial auction id to be used in the current test
        self.initial_auction_id = next(copy(Auction._id))

        # Create sample auctions with decreasing start_date values
        base_date = self.default_start_date + timedelta(hours=10)
        for token_id in self.available_ids:
            item = Item(DEFAULT_ERC_721, token_id)
            output = self.auctioneer.auction_create(
                title="title",
                description="description",
                start_date=base_date - timedelta(minutes=1),
                end_date=base_date,
                erc20=DEFAULT_ERC_20,
                item=item,
                min_bid_amount=1,
                seller=ALICE,
                current_date=self.auction_creation_date)
            base_date = base_date - timedelta(minutes=10)

    def assert_auctions_are_sorted_by(self, auctions, field):
        previous = None
        current = None
        for i in range(len(auctions)):
            previous = current
            current = auctions[i]
            if previous is not None:
                self.assertLess(previous.get(field),
                                current.get(field))

    def test_empty_query_return_auctions_ordered_by_id(self):
        # Given some auctions were created with decreasing start_date values
        # When listing them with no query string
        # A list of auctions ordered by their ids by default is returned
        output = self.auctioneer.auction_list()
        auctions = json.loads(hex_to_str(output.payload))

        self.assert_auctions_are_sorted_by(auctions, "id")

    def test_query_return_auctions_ordered_by_end_date(self):
        # Given some auctions were created with decreasing start_date values
        # When listing them sorted by end_date
        # A list of auctions ordered by the field end_date is returned
        query_params = {'sort': ['end_date']}
        output = self.auctioneer.auction_list(query=query_params)
        auctions = json.loads(hex_to_str(output.payload))

        self.assert_auctions_are_sorted_by(auctions, "end_date")

    def test_auctions_returned_with_offset(self):
        # Given some auctions were created with decreasing start_date values
        # When listing them with an offset value
        # A list of auctions offset by the given value is returned
        OFFSET = 2
        query_params = {'offset': [f'{OFFSET}']}
        output = self.auctioneer.auction_list(query=query_params)
        auctions = json.loads(hex_to_str(output.payload))

        self.assertEqual(len(auctions),
                         len(self.available_ids) - OFFSET)
        for i in range(len(auctions)):
            self.assertEqual(int(auctions[i].get("id")),
                             self.initial_auction_id + i + OFFSET)

    def test_auctions_returned_within_a_limit(self):
        # Given some auctions were created with decreasing start_date values
        # When listing them with a strict limit
        # A list of auctions with size limited by the given value is returned
        LIMIT = 1
        query_params = {'limit': [f'{LIMIT}']}
        output = self.auctioneer.auction_list(query=query_params)
        auctions = json.loads(hex_to_str(output.payload))

        self.assertEqual(len(auctions), LIMIT)
        self.assertEqual(auctions[0].get("id"), self.initial_auction_id)

    def test_auctions_returned_with_offset_and_within_a_limit(self):
        # Given some auctions were created with decreasing start_date values
        # When listing them with an offset value and a strict limit
        # A list of auctions offset by the given value, whose size is limited,
        # is returned
        LIMIT = 1
        OFFSET = 2
        query_params = {'offset': [f'{OFFSET}'], 'limit': [f'{LIMIT}']}
        output = self.auctioneer.auction_list(query=query_params)
        auctions = json.loads(hex_to_str(output.payload))

        self.assertEqual(len(auctions), LIMIT)
        self.assertEqual(int(auctions[0].get("id")),
                         self.initial_auction_id + OFFSET)


if __name__ == "__main__":
    unittest.main()
