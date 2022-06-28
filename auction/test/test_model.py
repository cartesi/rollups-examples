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
from datetime import datetime, timedelta, timezone
from test.test_fixtures import *

from auction.model import Auction, Bid, Item


class TestBids(unittest.TestCase):

    TEST_AUCTION_ID = 0

    def test_bid_equality(self):
        # Given there are two bids from the same author, with the same bid
        # amount and with the same timestamp
        # When comparing them
        # Then they are considered the same bid
        t = datetime.now(timezone.utc)
        bid_1 = Bid(self.TEST_AUCTION_ID, ALICE, 1, t)
        bid_2 = Bid(self.TEST_AUCTION_ID, ALICE, 1, t)

        self.assertEqual(bid_1, bid_2)

    def test_bids_different_due_to_author(self):
        # Given there are two bids from different authors
        # When comparing them
        # Then they are not the same bid
        t = datetime.now(timezone.utc)
        bid_1 = Bid(self.TEST_AUCTION_ID, ALICE, 1, t)
        bid_2 = Bid(self.TEST_AUCTION_ID, BOB, 1, t)

        self.assertNotEqual(bid_1, bid_2)

    def test_bids_different_due_to_amount(self):
        # Given there are two bids from the same author, with the same
        # timestamp but with different amounts
        # When comparing them
        # Then they are not the same bid
        t = datetime.now(timezone.utc)
        bid_1 = Bid(self.TEST_AUCTION_ID, ALICE, 1, t)
        bid_2 = Bid(self.TEST_AUCTION_ID, BOB, 2, t)

        self.assertNotEqual(bid_1, bid_2)

    def test_bids_different_due_to_timestamp(self):
        # Given there are two bids from the same author, with the same
        # amount but with different timestamps
        # When comparing them
        # Then they are not the same bid
        bid_1 = Bid(self.TEST_AUCTION_ID,
                    ALICE, 1, datetime.now(timezone.utc))
        bid_2 = Bid(self.TEST_AUCTION_ID,
                    BOB, 1, datetime.now(timezone.utc))

        self.assertNotEqual(bid_1, bid_2)

    def test_bid_greater_than_other_due_to_greater_amount(self):
        # Given there are two bids
        # When comparing them
        # Then the one with the larger amount is considered greater than the
        # other one
        bid_1 = Bid(self.TEST_AUCTION_ID, ALICE, 1, None)
        bid_2 = Bid(self.TEST_AUCTION_ID, BOB, 2, None)

        self.assertGreater(bid_2, bid_1)

    def test_bid_greater_than_other_due_to_older_timestamp(self):
        # Given there are two bids with the same bid amount
        # When comparing them
        # Then the one with the older timestamp is considered greater than the
        # other one
        now = datetime.now()
        bid_1 = Bid(self.TEST_AUCTION_ID,
                    ALICE, 1, now)
        bid_2 = Bid(self.TEST_AUCTION_ID,
                    BOB, 1, now + timedelta(minutes=1))

        self.assertGreater(bid_1, bid_2)

    def test_bid_lesser_than_other_due_to_minor_amount(self):
        # Given there are two bids
        # When comparing them
        # Then the one with the smaller amount is considered lesser than the
        # other one
        bid_1 = Bid(self.TEST_AUCTION_ID, ALICE, 1, None)
        bid_2 = Bid(self.TEST_AUCTION_ID, BOB, 2, None)

        self.assertLess(bid_1, bid_2)

    def test_bid_lesser_than_other_due_to_newer_timestamp(self):
        # Given there are two bids with the same bid amount
        # When comparing them
        # Then the one with the newer timestamp is considered lesser than the
        # other one
        now = datetime.now()
        bid_1 = Bid(self.TEST_AUCTION_ID,
                    ALICE, 1, now)
        bid_2 = Bid(self.TEST_AUCTION_ID,
                    BOB, 1, now + timedelta(minutes=1))

        self.assertLess(bid_2, bid_1)

    @unittest.expectedFailure
    def test_bid_greater_or_equal_to_fails(self):
        # Given there are two bids
        # When comparing them using __ge__
        # Then a failure occurs
        bid_1 = Bid(self.TEST_AUCTION_ID, None, 1, None)
        bid_2 = Bid(self.TEST_AUCTION_ID, None, 1, None)

        self.assertGreaterEqual(bid_1, bid_2)

    @unittest.expectedFailure
    def test_bid_less_or_equal_to_fails(self):
        # Given there are two bids
        # When comparing them using __le__
        # Then a failure occurs
        bid_1 = Bid(self.TEST_AUCTION_ID, None, 1, None)
        bid_2 = Bid(self.TEST_AUCTION_ID, None, 1, None)

        self.assertLessEqual(bid_1, bid_2)

    def test_bid_amount_is_greater_than_zero(self):
        # Given one wants to create a Bid with amount greater than zero
        # When creating such Bid
        # Then it succeeds
        bid = Bid(self.TEST_AUCTION_ID, None, 1, None)
        self.assertGreaterEqual(bid.amount, 0)

    @unittest.expectedFailure
    def test_bid_amount_is_zero(self):
        # Given one wants to create a Bid with amount equal to zero
        # When creating such Bid
        # Then it succeeds
        bid = Bid(self.TEST_AUCTION_ID, None, 0, None)

    @unittest.expectedFailure
    def test_bid_amount_is_zero(self):
        # Given one wants to create a Bid with amount smaller than zero
        # When creating such Bid
        # Then it succeeds
        bid = Bid(self.TEST_AUCTION_ID, None, -1, None)


class TestAuctionItems(unittest.TestCase):

    def test_item_equality(self):
        # Given there are two auction items referring to the same erc721 and
        # token_id
        # When comparing them
        # Then they should be considered equal
        item_1 = Item(DEFAULT_ERC_721, DEFAULT_TOKEN_ID)
        item_2 = Item(DEFAULT_ERC_721, DEFAULT_TOKEN_ID)

        self.assertEqual(item_1, item_2)

    def test_items_different_due_to_contract(self):
        # Given there are two auction items referring to different erc721
        # When comparing them
        # Then they should be considered diferent
        other_erc721 = "0x78Ef98A10298DK82278687912879117891901290"
        item_1 = Item(DEFAULT_ERC_721, DEFAULT_TOKEN_ID)
        item_2 = Item(other_erc721, DEFAULT_TOKEN_ID)

        self.assertNotEqual(item_1, item_2)

    def test_items_different_due_to_contract(self):
        # Given there are two auction items referring to different erc721
        # When comparing them
        # Then they should be considered diferent
        other_token_id = "https://another.nft"
        item_1 = Item(DEFAULT_ERC_721, DEFAULT_TOKEN_ID)
        item_2 = Item(DEFAULT_ERC_721, other_token_id)

        self.assertNotEqual(item_1, item_2)


class BaseAuctionTestCase(unittest.TestCase):

    def setUp(self):
        self.default_item = Item(DEFAULT_ERC_721, DEFAULT_TOKEN_ID)
        self.default_start_date = datetime.fromtimestamp(
            DEFAULT_START_DATE, timezone.utc)
        self.default_end_date = self.default_start_date + \
            timedelta(hours=2)
        self.valid_bidding_date = self.default_end_date - \
            timedelta(minutes=1)

        self.default_auction = Auction(
            ALICE,
            self.default_item,
            DEFAULT_ERC_20,
            "Default title for testing",
            "Default description for testing",
            self.default_start_date,
            self.default_end_date)

        self.default_auction._id = 0

        return super().setUp()

    def tearDown(self):
        self.default_auction.bids.clear()
        del self.default_auction

        return super().tearDown()


class TestAuctionCreation(BaseAuctionTestCase):

    def test_auction_default_values(self):
        # Given one wants to create an auction without setting a mininum bid
        # amount
        # When creating such auction
        # Then it's created with default values

        self.assertEqual(self.default_auction.state,
                         Auction.CREATED)
        self.assertEqual(self.default_auction.min_bid_amount,
                         Auction.MIN_BID_AMOUNT)

    def test_auction_min_bid_amount_setup(self):
        # Given one wants to create an auction with a mininum bid amount
        # When creating such auction
        # Then it's created with that min_bid_amount
        MIN_BID_AMOUNT = 2
        min_bid_amount_test_auction = Auction(
            ALICE,
            self.default_item,
            DEFAULT_ERC_20,
            "Auction for testing min_bid_amount configuration",
            "Default description for testing",
            self.default_start_date,
            self.default_end_date,
            MIN_BID_AMOUNT)

        self.assertEqual(min_bid_amount_test_auction.min_bid_amount,
                         MIN_BID_AMOUNT)

    @unittest.expectedFailure
    def test_auction_with_min_bid_amount_equal_to_zero(self):
        # Given one wants to create an auction with a mininum bid amount
        # equal to zero
        # When creating such auction
        # Then it fails
        INVALID_MIN_BID_AMOUNT = 0
        min_bid_amount_test_auction = Auction(
            ALICE,
            self.default_item,
            DEFAULT_ERC_20,
            "Auction for testing min_bid_amount configuration",
            "Default description for testing",
            self.default_start_date,
            self.default_end_date,
            INVALID_MIN_BID_AMOUNT)

    @unittest.expectedFailure
    def test_auction_with_min_bid_amount_smaller_than_zero(self):
        # Given one wants to create an auction with a mininum bid amount
        # smaller than zero
        # When creating such auction
        # Then it fails
        INVALID_MIN_BID_AMOUNT = -1
        min_bid_amount_test_auction = Auction(
            ALICE,
            self.default_item,
            DEFAULT_ERC_20,
            "Auction for testing min_bid_amount configuration",
            "Default description for testing",
            self.default_start_date,
            self.default_end_date,
            INVALID_MIN_BID_AMOUNT)

    def test_auction_with_end_date_after_start_date(self):
        # Given one wants to create an auction whose end date is after its
        # start date
        # When creating such auction
        # Then it's created correctly
        self.assertTrue(self.default_auction.start_date <
                        self.default_auction.end_date)

    @unittest.expectedFailure
    def test_auction_with_end_date_before_start_date_fails(self):
        # Given one wants to create an auction whose end date is before its
        # start date
        # When creating such auction
        # A failure occurs
        BAD_END_DATE = datetime.now(timezone.utc)
        START_DATE = datetime.now(timezone.utc)

        bad_end_date_auction = Auction(
            ALICE,
            self.default_item,
            DEFAULT_ERC_20,
            "Auction for testing a bad end date",
            "Default description for testing",
            START_DATE,
            BAD_END_DATE)

    @unittest.expectedFailure
    def test_auction_with_end_date_before_start_date_fails(self):
        # Given one wants to create an auction whose end date is the same as
        # its start date
        # When creating such auction
        # A failure occurs
        SAME_DATE = datetime.now(timezone.utc)

        bad_end_date_auction = Auction(
            ALICE,
            self.default_item,
            DEFAULT_ERC_20,
            "Auction for testing same start and end dates",
            "Default description for testing",
            SAME_DATE,
            SAME_DATE)


class TestBidding(BaseAuctionTestCase):

    @unittest.expectedFailure
    def test_bid_with_wrong_auction_id_fails(self):
        # Given there is a newly created auction
        # When one bids with an auction_id which does not match the auction's id
        # Then the bid fails
        BOGUS_AUCTION_ID = 1
        bid = Bid(BOGUS_AUCTION_ID, ALICE, 0, datetime.now(timezone.utc))
        self.default_auction.bid(bid)

    def test_default_mininum_bid_amount_is_met(self):
        # Given there is a newly created auction
        # When one bids an amount equal to the minimum bid amount
        # Then the bid is accepted
        bid = Bid(self.default_auction.id,
                  ALICE, 1, datetime.now(timezone.utc))
        self.default_auction.bid(bid)
        self.assertGreaterEqual(self.default_auction.bids.index(bid), 0)

    @unittest.expectedFailure
    def test_bid_fails_when_default_mininum_bid_amount_is_not_met(self):
        # Given there is a newly created auction
        # When one bids an amount smaller than the minimum bid amount
        # Then the bid fails
        bid = Bid(self.default_auction.id,
                  ALICE, 0, datetime.now(timezone.utc))
        self.default_auction.bid(bid)

    @unittest.expectedFailure
    def test_bid_fails_when_min_bid_amount_is_not_met(self):
        MIN_BID_AMOUNT = 2
        min_bid_amount_test_auction = Auction(
            ALICE,
            self.default_item,
            DEFAULT_ERC_20,
            "Auction for testing bidding against min_bid_amount",
            "Default description for testing",
            self.default_start_date,
            self.default_end_date,
            MIN_BID_AMOUNT)
        bid = Bid(min_bid_amount_test_auction.id,
                  ALICE, 1, datetime.now(timezone.utc))

        min_bid_amount_test_auction.bid(bid)

    @unittest.expectedFailure
    def test_bid_fails_when_mininum_bid_amount_is_not_met(self):
        # Given there is a newly created auction with a non-default minimum
        # bid amount
        # When bidding with an amount smaller than the minimum bid amount
        # Then the bid fails
        MIN_BID_AMOUNT = 2
        min_bid_amount_test_auction = Auction(
            ALICE,
            self.default_item,
            DEFAULT_ERC_20,
            "Auction for testing bidding against min_bid_amount",
            "Default description for testing",
            self.default_start_date,
            self.default_end_date,
            MIN_BID_AMOUNT)
        bid = Bid(min_bid_amount_test_auction.id,
                  ALICE, 1, datetime.now(timezone.utc))
        self.min_bid_amount_test_auction(bid)

    def test_greater_bid_amount_wins(self):
        # Given there is an ongoing auction
        # When a new bid is accepted and it's greater than the current winning
        # bid
        # Then the new bid becomes the winning bid
        losing_bid = Bid(self.default_auction.id,
                         ALICE, 1, datetime.now(timezone.utc))
        self.default_auction.bid(losing_bid)
        winning_bid = Bid(self.default_auction.id,
                          ALICE, 2, datetime.now(timezone.utc))
        self.default_auction.bid(winning_bid)

        self.assertEqual(winning_bid, self.default_auction.winning_bid)

    @unittest.expectedFailure
    def test_smaller_bid_amount_fails(self):
        # Given there is an ongoing auction
        # When one tries to place a new bid whose amounts is smaller than the
        # current winning bid
        # Then the bid fails to be placed
        winning_bid = Bid(self.default_auction.id,
                          ALICE, 2, datetime.now(timezone.utc))
        self.default_auction.bid(winning_bid)
        losing_bid = Bid(self.default_auction.id,
                         ALICE, 1, datetime.now(timezone.utc))
        self.default_auction.bid(losing_bid)

        self.assertEqual(winning_bid, self.default_auction.winning_bid)
        self.assertNotEqual(
            losing_bid, self.default_auction.winning_bid)


class TestAuctionLifeCycle(BaseAuctionTestCase):

    def test_auction_has_started(self):
        bid = Bid(self.default_auction.id,
                  ALICE, 1, datetime.now(timezone.utc))
        self.default_auction.bid(bid)

        self.assertEqual(self.default_auction.state,
                         Auction.STARTED)

    def test_auction_has_finished(self):
        self.default_auction.finish()

        self.assertEqual(self.default_auction.state,
                         Auction.FINISHED)

    @unittest.expectedFailure
    def test_bidding_fails_after_auction_is_finished(self):
        self.default_auction.finish()
        bid = Bid(self.default_auction.id,
                  ALICE, 1, datetime.now(timezone.utc))
        self.default_auction.bid(bid)


if __name__ == "__main__":
    unittest.main()
