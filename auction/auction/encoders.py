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

from datetime import datetime
from json import JSONEncoder

from auction.balance import Balance
from auction.model import Auction, Bid, Item


class PrivatePropertyEncoder(JSONEncoder):
    def _normalize_keys(self, dict: dict):
        new_dict = {}
        for item in dict.items():
            new_key = item[0][1:]
            new_dict[new_key] = item[1]
        return new_dict


class AuctionEncoder(PrivatePropertyEncoder):
    def default(self, o):
        if isinstance(o, Auction):
            props = o.__dict__.copy()
            props = self._normalize_keys(props)
            del props["bids"]
            return props
        elif isinstance(o, Bid):
            return BidEncoder().default(o)
        elif isinstance(o, Item):
            return ItemEncoder().default(o)
        elif isinstance(o, datetime):
            return DatetimeEncoder().default(o)

        return JSONEncoder.encode(self, o)


class BidEncoder(PrivatePropertyEncoder):
    def default(self, o):
        if isinstance(o, Bid):
            props = o.__dict__.copy()
            props = self._normalize_keys(props)
            return props
        elif isinstance(o, datetime):
            return DatetimeEncoder().default(o)

        return JSONEncoder.encode(self, o)


class ItemEncoder(PrivatePropertyEncoder):
    def default(self, o):
        if isinstance(o, Item):
            props = o.__dict__.copy()
            props = self._normalize_keys(props)
            return props

        return JSONEncoder.encode(self, o)


class DatetimeEncoder(JSONEncoder):
    def default(self, o):
        if isinstance(o, datetime):
            return o.timestamp()

        return JSONEncoder.encode(self, o)


class BalanceEncoder(PrivatePropertyEncoder):
    def default(self, o):
        if isinstance(o, Balance):
            props = o.__dict__.copy()
            props = self._normalize_keys(props)
            del props["account"]
            return props
        elif isinstance(o, set):
            return list(o)

        return JSONEncoder.encode(self, o)
