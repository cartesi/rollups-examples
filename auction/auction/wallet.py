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

from auction.balance import Balance
from auction.log import logger
from auction.outputs import Error, Notice, Voucher
from eth_abi import decode, encode
from auction.eth_abi_ext import decode_packed

# Function selector to be called during the execution of a voucher that transfers funds,
# which corresponds to the first 4 bytes of the Keccak256-encoded result of "transfer(address,uint256)"
TRANSFER_FUNCTION_SELECTOR = b'\xa9\x05\x9c\xbb'

# Function selector to be called during the execution of a voucher that transfers ERC-721, which
# corresponds to the first 4 bytes of the Keccak256-encoded result of 'safeTransferFrom(address,address,uint256)'
SAFE_TRANSFER_FROM_SELECTOR = b'B\x84.\x0e'

_accounts = dict[str: Balance]()


def _balance_get(account) -> Balance:
    balance = _accounts.get(account)

    if not balance:
        _accounts[account] = Balance(account)
        balance = _accounts[account]

    return balance


def balance_get(account) -> Balance:
    """Retrieve the balance of all ERC-20 and ERC-721 tokens for `account`"""

    logger.info(f"Balance for '{account}' retrieved")
    return _balance_get(account)


def erc20_deposit_process(payload:str):
    '''
    Process the ABI-encoded input data sent by the ERC20Portal
    after an ERC-20 deposit
        Parameters:
            payload (str): the binary input data as hex string.

        Returns:
            notice (Notice): A notice whose payload is the hex value for an ERC-20 deposit JSON.
            report (Error): A report detailing the operation's failure reason.
    '''
    # remove the '0x' prefix and convert to bytes
    binary_payload = bytes.fromhex(payload[2:])
    try:
        account, erc20, amount = _erc20_deposit_parse(binary_payload)
        logger.info(f"'{amount} {erc20}' tokens deposited "
                    f"in account '{account}'")
        return _erc20_deposit(account, erc20, amount)
    except ValueError as error:
        error_msg = f"{error}"
        logger.debug(error_msg, exc_info=True)
        return Error(error_msg)


def erc721_deposit_process(payload:str):
    '''
    Process the ABI-encoded input data sent by the ERC721Portal
    after an ERC-721 deposit
        Parameters:
            payload (str): the binary input data as hex string.

        Returns:
            notice (Notice): A notice whose payload is the hex value for an
            ERC-721 deposit JSON.
            report (Error): A report detailing the operation's failure reason.
    '''
    # remove the '0x' prefix and convert to bytes
    binary_payload = bytes.fromhex(payload[2:])
    try:
        account, erc721, token_id = _erc721_deposit_parse(binary_payload)
        logger.info(f"Token 'ERC-721: {erc721}, id: {token_id}' deposited "
                    f"in '{account}'")
        return _erc721_deposit(account, erc721, token_id)
    except ValueError as error:
        error_msg = f"{error}"
        logger.debug(error_msg, exc_info=True)
        return Error(error_msg)

def _erc20_deposit_parse(binary_payload: bytes):
    '''
    Retrieve the ABI-encoded input data sent by the ERC20Portal
    after an ERC-20 deposit.

        Parameters:
            binary_payload (bytes): ABI-encoded input

        Returns:
            A tuple containing:
                account (str): address which owns the tokens
                erc20 (str): ERC-20 contract address
                amount (int): amount of deposited ERC-20 tokens
    '''
    try:
        input_data = decode_packed(
            ['bool',     # Is a valid deposit
             'address',  # Address of the ERC-20 contract
             'address',  # Address which deposited the tokens
             'uint256'], # Amount of ERC-20 tokens being deposited
            binary_payload
        )

        valid = input_data[0]
        if not valid:
            raise ValueError("Invalid deposit with 'False' success flag")
        erc20 = input_data[1]
        account = input_data[2]
        amount = input_data[3]
        return account, erc20, amount
    except Exception as error:
        raise ValueError(
            "Payload does not conform to ERC-20 transfer ABI") from error


def _erc721_deposit_parse(binary_payload: bytes):
    '''
    Retrieve the ABI-encoded input data sent by the Portal
    after an ERC-721 deposit.

        Parameters:
            binary_payload (bytes): ABI-encoded input

        Returns:
            A tuple containing:
                account (str): address of the ERC-721 token owner
                erc721 (str): ERC-721 contract address
                token_id (int): ERC-721 token ID
    '''
    try:
        input_data = decode_packed(
            ['address',  # ERC-721 contract address
             'address',  # Address which called the safeTransferFrom function
             'uint256'], # The id of the NFT being deposited
            binary_payload
        )
        erc721 = input_data[0]
        account = input_data[1]
        token_id = input_data[2]

        return account, erc721, token_id
    except Exception as error:
        raise ValueError(
            "Payload does not conform to ERC-721 transfer ABI") from error


def _erc20_deposit(account, erc20, amount):
    '''
    Deposit ERC-20 tokens in account.

        Parameters:
            account (str): address who owns the tokens.
            erc20 (str): address of the ERC-20 contract.
            amount (float): amount of tokens to deposit.

        Returns:
            notice (Notice): A notice whose payload is the hex value for an
            ERC-20 deposit JSON.
    '''
    balance = _balance_get(account)
    balance._erc20_increase(erc20, amount)

    notice_payload = {
        "type": "erc20deposit",
        "content": {
            "address": account,
            "erc20": erc20,
            "amount": amount
        }
    }
    return Notice(json.dumps(notice_payload))


def _erc721_deposit(account, erc721, token_id):
    '''
    Deposit the ERC-721 token in account

        Parameters:
            account (str): address of the ERC-721 token owner
            erc721 (str): ERC-721 contract address
            token_id (int): ERC-721 token ID

        Returns:
            notice (Notice): A notice whose payload is the hex value for an
            ERC-721 deposit JSON
    '''
    balance = _balance_get(account)
    balance._erc721_add(erc721, token_id)

    notice_payload = {
        "type": "erc721deposit",
        "content": {
            "address": account,
            "erc721": erc721,
            "token_id": token_id
        }
    }
    return Notice(json.dumps(notice_payload))


def erc20_withdraw(account, erc20, amount):
    '''
    Extract ERC-20 tokens from account.

        Parameters:
            account (str): address who owns the tokens.
            erc20 (str): address of the ERC-20 contract.
            amount (float): amount of tokens to withdraw.

        Returns:
            voucher (Voucher): A voucher that transfers `amount` tokens to
            `account` address.
    '''
    balance = _balance_get(account)
    balance._erc20_decrease(erc20, amount)

    transfer_payload = TRANSFER_FUNCTION_SELECTOR + \
            encode(['address', 'uint256'], [account, amount])

    logger.info(f"'{amount} {erc20}' tokens withdrawn from '{account}'")
    return Voucher(erc20, transfer_payload)


def erc20_transfer(account, to, erc20, amount):
    '''
    Transfer ERC-20 tokens from `account` to `to`.

        Parameters:
            account (str): address who owns the tokens.
            to (str): address to send tokens to.
            erc20 (str): address of the ERC-20 contract.
            amount (int): amount of tokens to transfer.

        Returns:
            notice (Notice): A notice detailing the transfer operation.
    '''
    try:
        balance = _balance_get(account)
        balance_to = _balance_get(to)

        balance._erc20_decrease(erc20, amount)
        balance_to._erc20_increase(erc20, amount)

        notice_payload = {
            "type": "erc20transfer",
            "content": {
                "from": account,
                "to": to,
                "erc20": erc20,
                "amount": amount
            }
        }
        logger.info(f"'{amount} {erc20}' tokens transferred from "
                    f"'{account}' to '{to}'")
        return Notice(json.dumps(notice_payload))
    except Exception as error:
        error_msg = f"{error}"
        logger.debug(error_msg, exc_info=True)
        return Error(error_msg)


def erc721_withdraw(rollup_address, sender, erc721, token_id):
    try:
        balance = _balance_get(sender)
        balance._erc721_remove(erc721, token_id)
    except Exception as error:
        error_msg = f"{error}"
        logger.debug(error_msg, exc_info=True)
        return Error(error_msg)

    payload = SAFE_TRANSFER_FROM_SELECTOR + encode(
        ['address', 'address', 'uint256'],
        [rollup_address, sender, token_id]
    )
    logger.info(f"Token 'ERC-721: {erc721}, id: {token_id}' withdrawn "
                f"from '{sender}'")
    return Voucher(erc721, payload)


def erc721_transfer(account, to, erc721, token_id):
    '''
    Transfer a ERC-721 token from `account` to `to`.

        Parameters:
            account (str): address who owns the token.
            to (str): address to send token to.
            erc721 (str): address of the ERC-721 contract.
            token_id (int): the ID of the token being transfered.

        Returns:
            notice (Notice): A notice detailing the transfer operation.
    '''
    try:
        balance = _balance_get(account)
        balance_to = _balance_get(to)

        balance._erc721_remove(erc721, token_id)
        balance_to._erc721_add(erc721, token_id)

        notice_payload = {
            "type": "erc721transfer",
            "content": {
                "from": account,
                "to": to,
                "erc721": erc721,
                "token_id": token_id
            }
        }
        logger.info(f"Token 'ERC-721: {erc721}, id: {token_id}' transferred "
                    f"from '{account}' to '{to}'")
        return Notice(json.dumps(notice_payload))
    except Exception as error:
        error_msg = f"{error}"
        logger.debug(error_msg, exc_info=True)
        return Error(error_msg)
