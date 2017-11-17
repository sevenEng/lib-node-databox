Node Databox
============

A Nodejs library for interfacing with Databox APIs.

Installation
------------

To use this library in your node project, run:

    npm install --save node-databox

and then within your project:

    const databox = require('node-databox');

Usage
-----

> :warning: While this library is at [1.0.0](http://semver.org/spec/v2.0.0.html) the API may change.

Examples of usage are provided in the ./samples directory.

# Helper Functions

## getHttpsCredentials() ###

**Returns** An object containing the HTTPS credentials to pass to https.createServer when offering an https server. These are read form /run/secrets/DATABOX.pem and are generated by the container-manger at run time.

## NewDataSourceMetadata ()

**Returns** An empty object Description

Description are used to describe your data source when creating a new one. They look like this:

```JS
    {
        Description:    "", // Text Description of you dataSource
        ContentType:    "", // The format the data is written in
                            // JSON,BINARY or TEXT.
        Vendor:         "", // Your company name.
        DataSourceType: "", // A short type string that represents your data
                            // it is used by apps to find the data you offer.
        DataSourceID:   "", // the ID of this data source, as the crater you
                            // are responsible for ensuring this is unique
                            // within your datastore.
        StoreType:      "", // The type of store this uses
                            // (probably store-core)
        IsActuator:  false, // is this an IsActuator?
        Unit:           "", // Text representation of the units
        Location:       "", // Text representation of lactation Information
    };
```
## DataSourceMetadataToHypercat (DataSourceMetadata)

 Name | Type | Description |
| ---- | ---- | ----------- |
| _DataSourceMetadata_ | `Object` | An object of the form returned by NewDataSourceMetadata |

**Returns** An object representing the hypercat item represented by DataSourceMetadata.


# core-store

The databox core-store supports the writing and querying of TimeSeries (JSON format) and key value data (JSON,TEXT and Binary). It is the default store for Databox version 0.3.0 and grater.

## TimeSeries store

These functions allow you to manage data in the time series store.

### databox.coreStore.NewTimeSeriesClient (reqEndpoint, enableLogging)

**Returns** a new TimeSeriesClient that is connected to the provided store. The TimeSeriesClient supports the following functions:

### Write (dataSourceID, payload)

Writes data to the store for the given dataSourceID data is timestamped with milliseconds since the unix epoch on insert.

| Name | Type | Description |
| ---- | ---- | ----------- |
| _dataSourceID_ | `String` | dataSourceID to write to |
| _payload_ | `Object` | A JSON serializable Object to write to the store |

**Returns** a `Promise` that resolves with "created" on success or rejects with error message on error.

### WriteAt (dataSourceID, timestamp, payload)

Writes data to the store for the given dataSourceID at the given timestamp. Timestamp should be in milliseconds since the unix epoch.

| Name | Type | Description |
| ---- | ---- | ----------- |
| _dataSourceID_ | `String` | dataSourceID to write to |
| _timestamp_ | `Int` | milliseconds since the unix epoch |
| _payload_ | `Object` | A JSON serializable Object to write to the store |

**Returns** a `Promise` that resolves with "created" on success or rejects with error message on error.

### Latest (dataSourceID)

Reads the latest data written to the provided dataSourceID.

| Name | Type | Description |
| ---- | ---- | ----------- |
| _dataSourceID_ | `String` | dataSourceID to write to |

**Returns** a `Promise` that resolves with an Object of the form
```js
   {
      timestamp: 1510768103558,
      data: { data written by driver }
   }
```
 on success or rejects with error message on error.

### LastN (dataSourceID,n)

Reads the last N items written to the provided dataSourceID.

| Name | Type | Description |
| ---- | ---- | ----------- |
| _dataSourceID_ | `String` | dataSourceID to write to |
| _N_ | `Int` | number of results to return |

**Returns** a `Promise` that resolves with an ***array of Objects*** of the form
```js
   {
      timestamp: 1510768103558,
      data: { data written by driver }
   }
```
 on success or rejects with error message on error.

### Since (dataSourceID, sinceTimeStamp)

### Range (dataSourceID, formTimeStamp, toTimeStamp)

### Observe (dataSourceID,timeout)

This function allows you to receive data from a data source as soon as it is written.

| Name | Type | Description |
| ---- | ---- | ----------- |
| _dataSourceID_ | `String` | dataSourceID to write to |
| _timeout_ | `int` | stop sending data after timeout seconds |

**Returns** A `Promise` that resolves with an `EventEmitter` that emits `data` when data is written to the observed _dataSourceID_, the `Promise` rejects with an error. The `data` event will contain an an Object of the form
```js
   {
      timestamp: 1510768103558,
      data: { data written by driver }
   }
```

### StopObserving (dataSourceID)

Closes the connection to stop observing data on the provided _dataSourceID_.

| Name | Type | Description |
| ---- | ---- | ----------- |
| _dataSourceID_ | `String` | dataSourceID to write to |

**Returns** Void

### RegisterDatasource (DataSourceMetadata)

This function registers your data sources with your store. Registering your data source makes them available to databox apps.

| Name | Type | Description |
| ---- | ---- | ----------- |
| _DataSourceMetadata_ | `Object` | of the form returned by NewDataSourceMetadata |

**Returns** a `Promise` that resolves with "created" on success or rejects with error message on error.

## Key Value Store

The Key Value Store allows the storage of TEXT, JSON and binary data agents keys. The default content format is JSON.

### Write (dataSourceID, payload, contentFormat)

Writes data to the store for the given dataSourceID data. Writes to the same key overwrite the data.

| Name | Type | Description |
| ---- | ---- | ----------- |
| _dataSourceID_ | `String` | dataSourceID to write to |
| _payload_ | `Object` | A JSON serializable Object to write to the store |
| _contentFormat_ | `String` | JSON TEXT or BINARY |

**Returns** a `Promise` that resolves with "created" on success or rejects with error message on error.

### Read (dataSourceID, contentFormat)

Reads data from the store for the given dataSourceID. data is timestamped with milliseconds since the unix epoch on insert.

| Name | Type | Description |
| ---- | ---- | ----------- |
| _dataSourceID_ | `String` | dataSourceID to read form |
| _contentFormat_ | `String` | JSON TEXT or BINARY |

**Returns** a `Promise` that resolves with the data on success or rejects with error message on error. The type of the returned data depends on the _contentFormat_ read.


### Observe (dataSourceID,timeout,contentFormat)

This function allows you to receive data from a data source as soon as it is written.

| Name | Type | Description |
| ---- | ---- | ----------- |
| _dataSourceID_ | `String` | dataSourceID to write to |
| _timeout_ | `int` | stop sending data after timeout seconds |
| _contentFormat_ | `String` | JSON TEXT or BINARY |

**Returns** A `Promise` that resolves with an `EventEmitter` that emits `data` when data is written to the observed _dataSourceID_, the `Promise` rejects with an error. The `data` event will contain an an data stored at the provided dataSourceID. The type of the return data depends on _contentFormat_.

### StopObserving (dataSourceID)

Closes the connection to stop observing data on the provided _dataSourceID_.

| Name | Type | Description |
| ---- | ---- | ----------- |
| _dataSourceID_ | `String` | dataSourceID to write to |

**Returns** Void

### RegisterDatasource (DataSourceMetadata)

This function registers your data sources with your store. Registering your data source makes them available to databox apps.

| Name | Type | Description |
| ---- | ---- | ----------- |
| _DataSourceMetadata_ | `Object` | of the form returned by NewDataSourceMetadata |

**Returns** a `Promise` that resolves with "created" on success or rejects with error message on error.


# Store-json (legacy support deprecated after v0.3.0)

### waitForStoreStatus(href, status, maxRetries=10) ###

| Name | Type | Description |
| ---- | ---- | ----------- |
| _href_ | `String` | The store or datasource href |
| _status_ | `String` | The status to wait for (e.g. 'active' or 'standby') |
| _maxRetries_ | `Number` | Optional number of times to retry before timing out (default 10) |

**Returns** A `Promise` that resolves when a store status matches `status` or rejects with an error.

### catalog.getRootCatalog() ###

**Returns** A `Promise` that resolves with a JSON object of root catalog or rejects with an error.

### catalog.getStoreCatalog(href) ###

**Parameters**

| Name | Type | Description |
| ---- | ---- | ----------- |
| _href_ | `String` | The store or datasource href |

**Returns** A `Promise` that resolves with a JSON object of a store catalog or rejects with an error.

### catalog.listAvailableStores() ###

A convenience function for listing available stores.

**Returns** A `Promise` that resolves with an array of objects with a store `description`, `hostname`, and `href`, or rejects with an error

### catalog.walkStoreCatalogs() ###

**Returns** A `Promise` that resolves with a JSON array of all store catalogs the calling container has access to or rejects with an error

### catalog.mapStoreCatalogs(callback, thisArg) ###

**Parameters**

| Name | Type | Description |
| ---- | ---- | ----------- |
| _callback_ | `Function` | A function to map onto each store catalog |
| _thisArg_  | `Object`   | The value of `this` in the context of the callback function |

**Returns** A `Promise` that resolves with an array of return values of the callback called on each catalog or rejects with an error

### catalog.registerDatasource(href, metadata) ###

**Parameters**

| Name | Type | Description |
| ---- | ---- | ----------- |
| _href_     | `String` | The store or datasource href |
| _metadata_ | `Object` | Dataource metadata |

**Example**

    catalog.registerDatasource('https://some-store:8080', {
        description: 'Test item',
        contentType: 'text/plain',
        vendor: 'Databox Inc.',
        tyoe: 'Test',
        datasourceid: 'MyLongId',
        storeType: 'databox-store-blob',
        // Optional
        isActuator: false,
        // Optional
        unit: 'cm',
        // Optional
        location: 'kitchen'
    });

**Returns** A `Promise` that resolves or rejects with an error

### timeseries.latest(href) ###

Reads the latest entry from a given time series datasource

**Parameters**

| Name | Type | Description |
| ---- | ---- | ----------- |
| _href_ | `String` | The target datasource href |

**Returns** A `Promise` that resolves with the latest entry for this timeseries datasource or rejects with an error

### timeseries.latest(href, dataSourceID) ###

> :warning: Deprecated

Reads the latest entry from a given time series store

**Parameters**

| Name | Type | Description |
| ---- | ---- | ----------- |
| _href_         | `String` | The target store href |
| _dataSourceID_ | `String` | The target datasource ID |

**Returns** A `Promise` that resolves with the latest entry for this timeseries data store endpoint or rejects with an error

### timeseries.since(href, startTimestamp) ###

Reads since a given range from a given time series datasource

**Parameters**

| Name | Type | Description |
| ---- | ---- | ----------- |
| _href_           | `String` | The target datasource href |
| _startTimestamp_ | `Number` | The timestamp from which to query time series data (inclusive) |

**Returns** A `Promise` that resolves with an array of data for this timeseries datasource or rejects with an error

### timeseries.since(href, dataSourceID, startTimestamp) ###

> :warning: Deprecated

Reads since a given range from a given time series store

**Parameters**

| Name | Type | Description |
| ---- | ---- | ----------- |
| _href_           | `String` | The target store href |
| _dataSourceID_   | `String` | The target datasource ID |
| _startTimestamp_ | `Number` | The timestamp from which to query time series data (inclusive) |

**Returns** A `Promise` that resolves with an array of data for this timeseries data store endpoint or rejects with an error

### timeseries.range(href, startTimestamp, endTimestamp) ###

Reads in given range from a given time series datasource

**Parameters**

| Name | Type | Description |
| ---- | ---- | ----------- |
| _href_           | `String` | The target datasource href |
| _startTimestamp_ | `Number` | The timestamp from which to query time series data (inclusive) |
| _endTimestamp_   | `Number` | The timestamp to which to query time series data (inclusive) |

**Returns** A `Promise` that resolves with an array of data for this timeseries datasource or rejects with an error

### timeseries.range(href, dataSourceID, startTimestamp, endTimestamp) ###

> :warning: Deprecated

Reads in given range from a given time series store

**Parameters**

| Name | Type | Description |
| ---- | ---- | ----------- |
| _href_           | `String` | The target store href |
| _dataSourceID_   | `String` | The target datasource ID |
| _startTimestamp_ | `Number` | The timestamp from which to query time series data (inclusive) |
| _endTimestamp_   | `Number` | The timestamp to which to query time series data (inclusive) |

**Returns** A `Promise` that resolves with an array of data for this timeseries data store endpoint or rejects with an error

### timeseries.write(href, data) ###

Writes to a given time series datasource

**Parameters**

| Name | Type | Description |
| ---- | ---- | ----------- |
| _href_ | `String` | The target datasource href |
| _data_ | `Object` | An object to write to a datasource time series |

**Returns** A `Promise` that resolves with the document written to the store (including automatically added timestamp) or rejects with an error

### timeseries.write(href, dataSourceID, data) ###

> :warning: Deprecated

Writes to a given time series store

**Parameters**

| Name | Type | Description |
| ---- | ---- | ----------- |
| _href_         | `String` | The target store href |
| _dataSourceID_ | `String` | The target datasource ID |
| _data_         | `Object` | An object to write to a datasource time series |

**Returns** A `Promise` that resolves with the document written to the store (including automatically added timestamp) or rejects with an error

### keyValue.read(href) ###

Reads from a given key-value datasource

**Parameters**

| Name | Type | Description |
| ---- | ---- | ----------- |
| _href_ | `String` | The target datasource href |

**Returns** A `Promise` that resolves with the document at this endpoint or rejects with an error

### keyValue.read(href, key) ###

> :warning: Deprecated

Reads from a given key-value store

**Parameters**

| Name | Type | Description |
| ---- | ---- | ----------- |
| _href_ | `String` | The target store href |
| _key_  | `String` | The target key |

**Returns** A `Promise` that resolves with the document at this endpoint or rejects with an error

### keyValue.write(href, data) ###

Writes to a given key-value datasource

**Parameters**

| Name | Type | Description |
| ---- | ---- | ----------- |
| _href_ | `String` | The target datasource href |
| _data_ | `Object` | The value to write |

**Returns** A `Promise` that resolves with the document written to the store or rejects with an error

### keyValue.write(href, key, data) ###

> :warning: Deprecated

Writes to a given key-value store

**Parameters**

| Name | Type | Description |
| ---- | ---- | ----------- |
| _href_ | `String` | The target store href |
| _key_  | `String` | The target key |
| _data_ | `Object` | The value to write |

**Returns** A `Promise` that resolves with the document written to the store or rejects with an error

### subscriptions.connect(href) ###

Connects to a target store's notification service

**Parameters**

| Name | Type | Description |
| ---- | ---- | ----------- |
| _href_ | `String` | The target store or datasource href |

**Returns** A `Promise` that resolves with an `EventEmitter` that emits `open` when the notification stream is opened, and `data` with store write event notifications of data for every route the connecting container is subscribed to. The callback function for that event has three parameters: `hostname` (the source store), `datasourceID` (the triggering datasource), and `data` which is the data actually written to the store. Otherwise if there's an error setting up the connection, the `Promise` rejects with an error.

### subscriptions.subscribe(href, type) ###

Subscribes the caller to write notifications for a given route

**Parameters**

| Name | Type | Description |
| ---- | ---- | ----------- |
| _href_ | `String` | The target datasource href |
| _type_ | `String` | "ts" for time series stores or "kv" for key-value stores |

**Returns** A `Promise` that resolves silently if the subscription was a success or rejects with an error

### subscriptions.subscribe(href, dataSourceID, type) ###

> :warning: Deprecated

Subscribes the caller to write notifications for a given route

**Parameters**

| Name | Type | Description |
| ---- | ---- | ----------- |
| _href_         | `String` | The target store href |
| _dataSourceID_ | `String` | The target datasource ID |
| _type_         | `String` | "ts" for time series stores or "kv" for key-value stores |

**Returns** A `Promise` that resolves silently if the subscription was a success or rejects with an error

### subscrciptions.unsubscribe(href, type) ###

Unsubscribes the caller to write notifications for a given route

**Parameters**

| Name | Type | Description |
| ---- | ---- | ----------- |
| _href_ | `String` | The target datasource href |
| _type_ | `String` | "ts" for time series stores or "kv" for key-value stores |

**Returns** A `Promise` that resolves silently if the unsubscription was a success or rejects with an error

### subscrciptions.unsubscribe(href, dataSourceID, type) ###

> :warning: Deprecated

Unsubscribes the caller to write notifications for a given route

**Parameters**

| Name | Type | Description |
| ---- | ---- | ----------- |
| _href_         | `String` | The target store href |
| _dataSourceID_ | `String` | The target datasource ID |
| _type_         | `String` | "ts" for time series stores or "kv" for key-value stores |

**Returns** A `Promise` that resolves silently if the unsubscription was a success or rejects with an error

### export.longpoll(destination, payload) ###

Exports data and retrieves response via long polling

**Parameters**

| Name | Type | Description |
| ---- | ---- | ----------- |
| _destination_ | `String` | An HTTPS URL to the export destination |
| _payload_     | `Object` | Data to POST to destination |

**Returns** A `Promise` that resolves with the destination server's response or rejects with an error

### export.queue(destination, payload) ###

> :warning: Currently unimplemented

Pushes data to an export queue and retrieves response via polling

**Parameters**

| Name | Type | Description |
| ---- | ---- | ----------- |
| _destination_ | `String` | An HTTPS URL to the export destination |
| _payload_     | `Object` | Data to POST to destination |

**Returns** A `Promise` that resolves with the destination server's response or rejects with an error
