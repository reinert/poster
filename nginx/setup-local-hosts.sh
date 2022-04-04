#!/bin/bash
hosts_line="127.0.0.1	posterr.local server.posterr.local"
grep -qxF "$hosts_line" /etc/hosts || echo "$hosts_line" >> /etc/hosts
