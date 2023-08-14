from eth_abi.codec import (
    ABICodec,
)
from eth_abi.registry import (
    registry_packed,
    BaseEquals
)
from eth_abi.decoding import (
    BooleanDecoder,
    AddressDecoder,
    UnsignedIntegerDecoder
)



class PackedBooleanDecoder(BooleanDecoder):
    data_byte_size = 1 

class PackedAddressDecoder(AddressDecoder):
    data_byte_size = 20

registry_packed.register_decoder(
    BaseEquals("bool"),
    PackedBooleanDecoder,
    label="bool",
)

registry_packed.register_decoder(
    BaseEquals("address"),
    PackedAddressDecoder,
    label='address'
)

registry_packed.register_decoder(
    BaseEquals("uint"),
    UnsignedIntegerDecoder,
    label="uint"
)


default_codec_packed = ABICodec(registry_packed)

decode_packed = default_codec_packed.decode