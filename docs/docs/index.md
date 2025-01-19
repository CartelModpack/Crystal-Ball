---
title: API Documentation
---

# API Docs

Documentation on API endpoints and their results.

## Tools

These are not really API endpoints, but are used for things such as config, etc...

Can be accessed at: `{!partials/text/tools_root.md!}`

/// details | `GET /schema/options`
    type: get-request

### ![GET](https://img.shields.io/badge/GET-2b9b46?style=flat-square) [`{!partials/text/tools_root.md!}/schema/options`]({!partials/text/tools_root.md!}/schema/options)

Returns a JSON schema for `config.json`.

///

## /v1 Endpoints

Endpoints for v1 of the Crystal Ball API.

Can be accessed at: `{!partials/text/api_v1_root.md!}`

### Authentication

/// details | `POST /auth/login`
    type: post-request

### ![POST](https://img.shields.io/badge/POST-eecd48?style=flat-square) [`{!partials/text/api_v1_root.md!}/auth/login`]({!partials/text/api_v1_root.md!}/auth/login)

Issue a token to access uploading modpacks, etc.

{!partials/alerts/admin_acc.md!}

#### Body

| Key      |   Type   | Required | Explanation               |
| :------- | :------: | :------: | :------------------------ |
| username | `string` |   Yes    | The username of the user. |
| password | `string` |   Yes    | The password of the user. |

#### Response

| Key   |   Type   | Value                                                                               |
| :---- | :------: | :---------------------------------------------------------------------------------- |
| token | `string` | A JWT Bearer token to be used in the authorization header. Is valid for 15 minutes. |

///

### Modpacks

/// details | `GET /packs`
    type: get-request

### ![GET](https://img.shields.io/badge/GET-2b9b46?style=flat-square) [`{!partials/text/api_v1_root.md!}/packs`]({!partials/text/api_v1_root.md!}/packs)

Gets a list of all modpacks in the database, lists the versions that support the given Minecraft version if specifed.

#### Query Paramaters

| Name      | Value                                |
| :-------- | :----------------------------------- |
| `version` | The version of Minecraft being used. |

#### Response

<table>
        <tr>
            <th>Array</th>
        </tr>
        <tr>
            <td>
                {!partials/types/modpack.md!lines=1-42}
            </td>
        </tr>
</table>

///

/// details | `POST /packs/create`
    type: post-request

### ![POST](https://img.shields.io/badge/POST-eecd48?style=flat-square) [`{!partials/text/api_v1_root.md!}/packs/create`]({!partials/text/api_v1_root.md!}/packs/create)

> Requires authentication.

Adds a new modpack to the database.

#### Body

{!partials/types/modpack.md!lines=43-92}

#### Response

{!partials/types/modpack.md!lines=1-42}

///
