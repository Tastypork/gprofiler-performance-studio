#!/bin/bash

# INTEL CONFIDENTIAL
# Copyright (C) 2023 Intel Corporation
# This software and the related documents are Intel copyrighted materials, and your use of them is governed by the express license under which they were provided to you ("License"). Unless the License provides otherwise, you may not use, modify, copy, publish, distribute, disclose or transmit this software or the related documents without Intel's prior written permission.
# This software and the related documents are provided as is, with no express or implied warranties, other than those that are expressly stated in the License.


source .env

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

CWD="$(basename $PWD)"
GPROFILER_NETWORK="${CWD}_default"
GPROFILER_CONTAINERS=(gprofiler-ps-nginx-load-balancer gprofiler-ps-clickhouse gprofiler-ps-webapp gprofiler-ps-ch-indexer gprofiler-ps-postgres gprofiler-ps-ch-rest-service gprofiler-ps-agents-logs-backend)

echo "--- NETWORKS ---"
# Test is GPROFILER_NETWORK exists
if docker network ls | grep -q $GPROFILER_NETWORK; then
    echo -e "[${GREEN}OK${NC}] $GPROFILER_NETWORK network found"
else
    echo -e "[${RED}ERROR${NC}] $GPROFILER_NETWORK network not found"
fi

# Test ICC enabled
icc_on_bridge=$(docker inspect -f '{{index .Options "com.docker.network.bridge.enable_icc"}}' bridge)
if [ $icc_on_bridge = "true" ]; then
    echo -e "[${GREEN}OK${NC}] icc enabled on network bridge"
else
    echo -e "[${YELLOW}WARNING${NC}] icc disabled on network bridge"
fi

echo "--- CONTAINERS ---"
# Test if all GPROFILER_CONTAINERS exists in GPROFILER_NETWORK and they have IP addresses and proper aliases
output=$(docker network inspect -f '{{range .Containers}}{{.Name}} {{end}}' $GPROFILER_NETWORK)
for i in "${GPROFILER_CONTAINERS[@]}"
do
  echo $output
  echo $i
    if [[ "$output" == *"$i"* ]]; then
        container_ip=$(docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $i)
        container_aliases=$(docker inspect -f '{{range.NetworkSettings.Networks}}{{.Aliases}}{{end}}' $i)
        alias=${i#gprofiler-ps-}
        if [[ $container_ip =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]] && [[ "$container_aliases" == *"$alias"* ]]; then
            echo -e "[${GREEN}OK${NC}] container $i exists in network $GPROFILER_NETWORK (IP: $container_ip) (Alias: $container_aliases)"
        else
            echo -e "[${RED}ERROR${NC}] container $i has bad network settings (IP: $container_ip) (Alias: $container_aliases)"
        fi
    else
        echo -e "[${RED}ERROR${NC}] container $i NOT exists in network $GPROFILER_NETWORK"
    fi
done

echo "--- CLICKHOUSE SCHEMA ---"
if docker exec gprofiler-ps-clickhouse clickhouse-client --query="SHOW DATABASES" | grep -q "flamedb"; then
	echo -e "[${GREEN}OK${NC}] database flamedb exists"
else
	echo -e "[${RED}ERROR${NC}] database flamedb not exists"
fi

if docker exec gprofiler-ps-clickhouse clickhouse-client --database=flamedb --query="SHOW TABLES" | grep -q "samples"; then
        echo -e "[${GREEN}OK${NC}] table flamedb.samples exists"
else
        echo -e "[${RED}ERROR${NC}] table flamedb.samples not exists"
fi

curl_cmd="echo 'SELECT database,name from system.tables' | curl -s 'http://$CLICKHOUSE_USER:$CLICKHOUSE_PASSWORD@db_clickhouse:8123/?query=' --data-binary @-"
if docker exec gprofiler-ps-ch-rest-service bash -c "$curl_cmd" | grep -q "samples"; then
	echo -e "[${GREEN}OK${NC}] clickhouse accessible by HTTP port and schema created"
else
        echo -e "[${RED}ERROR${NC}] clickhouse not accessible by HTTP port or schema not created"
fi

# Test container connectivity
# ping from container A container B
echo "--- CONNECTIVITY ---"
for i in "gprofiler-ps-ch-rest-service db_clickhouse"
do
	set -- $i
	docker exec $1 ping $2 -c2 > /dev/null
	if [ $? -eq 0 ]
	then
	  echo -e "[${GREEN}OK${NC}] container $2 reachable from $1"
	else
	  echo -e "[${RED}ERROR${NC}] container $2 unreachable from $1"
	fi
done
