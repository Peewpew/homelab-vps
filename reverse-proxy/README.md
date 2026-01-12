# Reverse Proxy

This folder contains the reverse proxy configuration for routing HTTP(S) traffic to services on the VPS.

## Contents

- `docker-compose.yml`: Defines the reverse proxy container (Nginx or Traefik)
- `nginx.conf` or Traefik config: Maps domains to services (Immich, website)
- LetsEncrypt or certificate management settings

## Notes

- All external traffic to the VPS goes through this container
- Handles TLS/HTTPS termination
- Routes traffic based on domain or path to the correct service
