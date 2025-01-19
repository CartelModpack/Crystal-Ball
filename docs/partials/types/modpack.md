<table>
  <tr>
    <th>Key</th>
    <th>Type</th>
    <th>Value</th>
  </tr>
  <tr>
    <td>slug</td>
    <td><code>string</code></td>
    <td>A unique, readable identifier for a modpack.</td>
  </tr>
  <tr>
    <td>inherits</td>
    <td><code>string</code></td>
    <td>The slug of the modpack that is this one inherits from.</td>
  </tr>
  <tr>
    <td>supportedVersions</td>
    <td><code>string</code></td>
    <td>A CSV list of supported Minecraft versions/version lists. Ex: <code>>=1.21,1.20.4</code></td>
  </tr>
  <tr>
    <td>mods</td>
    <td><code>string</code></td>
    <td>A CSV list of mods and their resource location included in this modpack.</td>
  </tr>
  <tr>
    <td>resources</td>
    <td><code>string</code></td>
    <td>A CSV list of resource packs and their resource location.</td>
  </tr>
  <tr>
    <td>shaders</td>
    <td><code>string</code></td>
    <td>A CSV list of shader packs and their resource location.</td>
  </tr>
  <tr>
    <td>configs</td>
    <td><code>string</code></td>
    <td>A CSV list of configuration files.</td>
  </tr>
</table>
<table>
  <tr>
    <th>Key</th>
    <th>Required</th>
    <th>Type</th>
    <th>Value</th>
  </tr>
  <tr>
    <td>slug</td>
    <td>Yes</td>
    <td><code>string</code></td>
    <td>A unique, readable identifier for a modpack.</td>
  </tr>
  <tr>
    <td>inherits</td>
    <td>Yes</td>
    <td><code>string</code></td>
    <td>The slug of the modpack that is this one inherits from.</td>
  </tr>
  <tr>
    <td>supportedVersions</td>
    <td>Yes</td>
    <td><code>string</code></td>
    <td>A CSV list of supported Minecraft versions/version lists. Ex: <code>>=1.21,1.20.4</code></td>
  </tr>
  <tr>
    <td>mods</td>
    <td>Yes</td>
    <td><code>string</code></td>
    <td>A CSV list of mods and their resource location included in this modpack.</td>
  </tr>
  <tr>
    <td>resources</td>
    <td>Yes</td>
    <td><code>string</code></td>
    <td>A CSV list of resource packs and their resource location.</td>
  </tr>
  <tr>
    <td>shaders</td>
    <td>Yes</td>
    <td><code>string</code></td>
    <td>A CSV list of shader packs and their resource location.</td>
  </tr>
  <tr>
    <td>configs</td>
    <td>Yes</td>
    <td><code>string</code></td>
    <td>A CSV list of configuration files.</td>
  </tr>
</table>