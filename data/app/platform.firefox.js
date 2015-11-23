var YTG = YTG || {};

YTG.platform = (function (YTG, platform) {

    platform.callbacks = [];

	platform.getStorageItem = function(key, callback)
	{
        var uuid = platform.uuid();

        if (typeof(callback) == 'function')
        {
            platform.callbacks[uuid] = callback;
        }

        self.port.emit("getStorage", {uuid: uuid});
	};

	platform.setStorageItem = function(key, value, callback)
	{
        var uuid = platform.uuid();

		if (typeof(callback) == 'function')
        {
            platform.callbacks[uuid] = callback;
        }

		self.port.emit("setStorage", {key: key, value: value, uuid: uuid});
	};

    // http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
    platform.uuid = function()
    {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = crypto.getRandomValues(new Uint8Array(1))[0]%16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    };

	return platform;
}(YTG, YTG.platform || {}));

self.port.on('executeCallback', function(payload)
{
    console.log(payload);
    if (YTG.platform.callbacks[payload.uuid])
    {
        YTG.platform.callbacks[payload.uuid](payload.data);

        // Remove the callback.
        YTG.platform.callbacks.splice(payload.uuid, 1);
    }
});