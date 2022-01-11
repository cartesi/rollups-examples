#!/bin/bash

cartesi-machine --ram-length=128Mi --rollup --htif-yield-manual --htif-yield-automatic  --flash-drive=label:echo-dapp,filename:echo-dapp.ext2 --flash-drive=label:root,filename:rootfs.ext2 --ram-image=linux-5.5.19-ctsi-3.bin --rom-image=rom.bin -i -- "/bin/sh"

