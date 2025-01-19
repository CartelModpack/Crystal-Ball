---
title: API Documentation
---

# API Docs

Documentation on API endpoints and their results.

## /v1 Endpoints

Endpoints for v1 of the Crystal Ball API.

Can be accessed at: `{!partials/text/api_v1_root.md!}`

### Schema

/// details | `GET /schema/options`
    type: get-request

### ![GET](https://img.shields.io/badge/GET-2b9b46?style=flat-square) [`{!partials/text/api_v1_root.md!}/schema/options`]({!partials/text/api_v1_root.md!}/schema/options)

Returns a JSON schema for `config.json`.

#### Schema Options

See [JSON Schema Draft 7](https://json-schema.org/draft-07) for more information.

| Key         | Type      | Required     | Description |
| :---------- | :-------- | :----------- | :---------- |
| dev         | `boolean` | No           | If the server should be run in developer mode. Defaults to `false`, and you shouldn't enable this unless you know what your doing. |
| devDocsPort | `number`  | Yes if `dev` | When in dev mode, the port of the `mkdocs` development server. |
| verbose     | `boolean` | No           | If the server should run in verbose mode, with extra console information. |
| database    | `string`  | No           | The relative path to the database file. Defaults to `data.db` |
| port        | `number`  | Yes          | The port that the server will run on. |
| jwt         | `string`  | No           | The JSON Web Token secret. Defaults to a randomly generated token. |

///

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
