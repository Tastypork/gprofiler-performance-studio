# INTEL CONFIDENTIAL
# Copyright (C) 2023 Intel Corporation
# This software and the related documents are Intel copyrighted materials, and your use of them is governed by the express license under which they were provided to you ("License"). Unless the License provides otherwise, you may not use, modify, copy, publish, distribute, disclose or transmit this software or the related documents without Intel's prior written permission.
# This software and the related documents are provided as is, with no express or implied warranties, other than those that are expressly stated in the License.

import datetime
from enum import Enum
from typing import Dict, Optional

from pydantic import BaseModel


class CloudProvider(str, Enum):
    AWS = "AWS"
    GCP = "GCP"
    Azure = "Azure"
    Unknown = "Unknown"

    @classmethod
    def _missing_(cls, name):
        for member in cls:
            if member.name.lower() == name.lower():
                return member
        return None


class AgentMetadata(BaseModel):
    current_time: datetime.datetime
    spawn_time: datetime.datetime
    spawn_uptime_ms: int
    public_ip: str
    private_ip: str
    hostname: str
    cloud_provider: CloudProvider
    instance_type: str
    processors: int
    memory_capacity_mb: int
    system_name: str
    os_name: str
    os_release: str
    kernel_release: str
    kernel_version: str
    hardware_type: str
    cloud_info: Dict = {}
    pid: int
    mac_address: str
    agent_version: str
    libc_type: str
    libc_version: str
    python_version: str
    run_mode: str
    deployment_type: str
    run_arguments: Dict
    big_data: Dict = {}


class GetServiceResponse(BaseModel):
    service_id: int
    profiler_process_id: Optional[int]
    does_service_exist: bool
