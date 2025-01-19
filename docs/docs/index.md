---
title: API Documentation
---

# API Docs

Documentation on API endpoints and their results.

## Tools

These are not really API endpoints, but are used for things such as config, etc...

??? get-request "GET /schema/options"

    ### ![GET](https://img.shields.io/badge/GET-2b9b46?style=flat-square) `/schema/options`

    Returns a JSON schema for `config.json`.

## /v1 Endpoints

Endpoints for v1 of the Crystal Ball API.

### Authentication

??? post-request "POST /auth/login"

    ### ![POST](https://img.shields.io/badge/POST-eecd48?style=flat-square) `/auth/login`

    Issue a token to access uploading modpacks, etc.

    ??? warning "Self-Hosted Instances"

        If your hosting your own version of Crystal Ball, the server boots with a default `admin` account with the password set to `admin`. Don't forget to remove this account once your all set up.

    #### Body

    | Key      | Required | Explanation               |
    | :------- | :------: | :------------------------ |
    | username |   Yes    | The username of the user. |
    | password |   Yes    | The password of the user. |

    #### Response

    | Key   |   Type   | Value                                                                               |
    | :---- | :------: | :---------------------------------------------------------------------------------- |
    | token | `string` | A JWT Bearer token to be used in the authorization header. Is valid for 15 minutes. |

### Modpacks

??? get-request "GET /modpacks/list"

    ### ![GET](https://img.shields.io/badge/GET-2b9b46?style=flat-square) `/modpacks/list`

    Gets a list of all modpacks in the database, lists the versions that support the given Minecraft version if specifed.

    #### Query Paramaters

    | Name      | Value                                |
    | :-------- | :----------------------------------- |
    | `version` | The version of Minecraft being used. |

    #### Response

    | Key               |   Type   | Value                                                                         |
    | :---------------- | :------: | :---------------------------------------------------------------------------- |
    | slug              | `string` | A unique, readable identifier for a modpack.                                  |
    | inherits          | `string` | The slug of the modpack that is this one inherits from.                       |
    | supportedVersions | `string` | A CSV list of supported Minecraft versions/version lists. Ex: `>=1.21,1.20.4` |
    | mods              | `string` | A CSV list of mods and their resource location included in this modpack.      |
    | resources         | `string` | A CSV list of resource packs and their resource location.                     |
    | shaders           | `string` | A CSV list of shader packs and their resource location.                       |
    | configs           | `string` | A CSV list of configuration files.                                            |
