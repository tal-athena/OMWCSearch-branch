importScripts("fakeDOM.js");
importScripts("jquery-2.1.4.min.js");
importScripts("../../jquery.signalR-2.0.3.js");
importScripts("../../../signalr/hubs");

var _hub;
var _connectionID;
var _tickersInfo;

var _tickers = [];

var _ports = [];

onconnect = function(event)
{
	var port = event.ports[0];
	var currentPortData = {
			port: port,
			isInitialized: false
		};
	_ports.push(currentPortData);

	port.start();

	port.addEventListener("message", function (event)
	{
		if (event.data)
		{
			if (event.data.loggedIn !== undefined)
			{
				close();
			}
			else if (event.data.setActiveIndex !== undefined)
			{
				var index = event.data.setActiveIndex;
				if (index >= 0 && index < _tickersInfo.tickerSearchInfos.length)
				{
					var isActive = event.data.isActive;
					var tickerInfo = _tickersInfo.tickerSearchInfos[index];
					tickerInfo.active = isActive;

					for (var i = 0; i < _ports.length; i++)
					{
						var portData = _ports[i];
						if (portData.isInitialized)
						{
							portData.port.postMessage({
								updateTickersInfo: _tickersInfo
							});
						}
					}

					for (var i = 0; i < _tickers.length; i++)
					{
						var ticker = _tickers[i];
						if (ticker.lowId == tickerInfo.lowId)
						{
							ticker.hits = [];
							break;
						}
					}

					postTickersToClients();
				}
			}
			else if (event.data.tickerIndex !== undefined && event.data.tickerHitIndex !== undefined)
			{
				var tickerIndex = event.data.tickerIndex;
				var tickerHitIndex = event.data.tickerHitIndex;
				if (tickerIndex >= 0 && tickerIndex < _tickers.length)
				{
					var tickerData = _tickers[tickerIndex];
					if (tickerHitIndex >= 0 && tickerHitIndex < tickerData.hits.length)
					{
						tickerData.hits.splice(tickerHitIndex, 1);

						postTickersToClients();
					}
				}
			}
		}
	});

	if (!_hub)
	{
		_hub = $.connection.tickerHub;
		_hub.client.initalize = function(connectionID)
		{
			_connectionID = connectionID;

			$.get("http://localhost/OMWebiSearch/Helpers/Ticker/StartCurrentSession?connectionID=" + connectionID,
				function (response)
				{
					if (!response)
						return;

					_tickersInfo = response;

					for (var i = 0; i < _ports.length; i++)
					{
						var portData = _ports[i];
						if (!portData.isInitialized)
						{
							portData.port.postMessage({
								tickersInfo: _tickersInfo
							});

							portData.isInitialized = true;
						}
					}

					postTickersToClients();
				});
		};

		_hub.client.onTickerDataPush = function(lowId, systemId, data)
		{
			if (!_connectionID || !_tickersInfo)
				return;

			var newTickers = {
				lowId: lowId,
				systemId: systemId,
				data: data
			};

			addTickers(newTickers);

			postTickersToClients();
		};

		$.connection.hub.start().done(function()
		{
			// Initialization done
		});
	}
	else if (!!_tickersInfo)
	{
		port.postMessage({
			tickersInfo: _tickersInfo
		});

		port.postMessage({
			tickers: _tickers
		});

		currentPortData.isInitialized = true;
	}

	function addTickers(update)
	{
		if (!isTickerActive(update.lowId))
			return;

		var tickerToUpdate = null;
		for (var i = 0; i < _tickers.length; i++)
		{
			if (_tickers[i].lowId == update.lowId)
			{
				tickerToUpdate = _tickers[i];
				tickerToUpdate.hits = tickerToUpdate.hits.concat(update.data);
				break;
			}
		}

		if (!tickerToUpdate)
		{
			_tickers.push({
				lowId: update.lowId,
				systemId: update.systemId,
				hits: update.data
			});
		}
	}

	function isTickerActive(lowId)
	{
		for (var i = 0; i < _tickersInfo.tickerSearchInfos.length; i++)
		{
			var tickerInfo = _tickersInfo.tickerSearchInfos[i];
			if (tickerInfo.lowId == lowId)
				return tickerInfo.active === undefined ? true : tickerInfo.active;
		}

		return false;
	}

	function postTickersToClients()
	{
		for (var i = 0; i < _ports.length; i++)
		{
			var portData = _ports[i];
			if (portData.isInitialized)
			{
				portData.port.postMessage({
						tickers: _tickers
					});
			}
		}
	}
};
