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

import logging
import os
from datetime import datetime, timezone

LOG_FMT = 'level={levelname} ts={asctime} module={module} msg="{message}"'
LOG_LEVEL = "INFO"

LOG_LEVEL_ENV_VAR = "LOG_LEVEL"
if LOG_LEVEL_ENV_VAR in os.environ:
    LOG_LEVEL = os.environ.get(LOG_LEVEL_ENV_VAR)

logging.basicConfig(level=LOG_LEVEL, format=LOG_FMT, style="{")

# ISO-8061 date format
logging.Formatter.formatTime = (lambda self, record, datefmt=None:
                                datetime.fromtimestamp(
                                    record.created, timezone.utc)
                                .astimezone()
                                .isoformat(sep="T", timespec="milliseconds"))

logger = logging.getLogger(__name__)
