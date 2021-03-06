/**
 * @class Ext.data.LocalStorageProxy
 * @extends Ext.data.WebStorageProxy
 * Proxy which uses HTML5 local storage as its data storage/retrieval mechanism.
 * If this proxy is used in a browser where local storage is not supported, the constructor will throw an error.
 * A local storage proxy requires a unique ID which is used as a key in which all record data are stored in the
 * local storage object. It is the developer's responsibility to ensure uniqueness of this key as it cannot be
 * reliably determined otherwise. If no id is provided but the attached store has a storeId, the storeId will be
 * used. If neither option is presented the proxy will throw an error.
 * Example usage:
<pre><code>
new Ext.data.Store({
    proxy: new Ext.data.LocalStorageProxy({
        id: 'myProxyKey'
    })
});
</code></pre>
 */
Ext.data.LocalStorageProxy = Ext.extend(Ext.data.WebStorageProxy, {
    //inherit docs
    getStorageObject: function() {
        return localStorage;
    }
});