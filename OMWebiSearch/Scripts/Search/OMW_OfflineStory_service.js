(function()
{
	'use strict';

	var currentScript = function()
	{
		var scripts = document.getElementsByTagName("script");
		var currentScriptPath = scripts[scripts.length - 1].src;
		return currentScriptPath;
	};
	var currentScriptPath = currentScript();

	//var _template = currentScriptPath.replace('OMW_ListFieldDialog.js', 'ListFieldDialog.html');
	var _template = '/OMWebiSearch/Helpers/Helper/OfflineStoryDialog';
	var _controller = 'OMWOfflineStoryCtrl';

	angular.module('omwShared')
		.factory('OMWOfflineStoryDialogSvc',
			[
				'$document', '$window', '$compile', '$controller', '$http', '$rootScope', '$q', '$templateRequest', '$timeout', 'KeyboardNavigationSvc',
				function($document, $window, $compile, $controller, $http, $rootScope, $q, $templateRequest, $timeout, KeyboardNavigationSvc)
				{
					//  Get the body of the document, we'll add the modal to this.
					var body = $document.find('body');

					function ModalService()
					{
						var self = this;

						//  Returns a promise which gets the template, either
						//  from the template parameter or via a request to the
						//  template url parameter.
						var getTemplate = function(template, templateUrl)
						{
							var deferred = $q.defer();
							if (template)
								deferred.resolve(template);
							else if (templateUrl)
							{
								$templateRequest(templateUrl, true)
									.then(function(template)
										{
											deferred.resolve(template);
										},
										function(error)
										{
											deferred.reject(error);
										});
							} else
							{
								$templateRequest(_template, true)
									.then(function(template)
										{
											deferred.resolve(template);
										},
										function(error)
										{
											deferred.reject(error);
										});
							}
							return deferred.promise;
						};

						var appendChild = function(parent, child)
						{
							angular.element(parent).append(child);
						};

						self.InitPopUp = function(type)
						{
							//return new dialog object that will have methods
							var modalObject = {};

							modalObject.open = function(data, callback, options, closeCallback)
							{
								options = options || {};
								options.controller = options.controller || _controller;

								//  Create a deferred we'll resolve when the modal is ready.
								var deferred = $q.defer();

								//  Get the actual html of the template.
								getTemplate(options.template, options.templateUrl)
									.then(function(template)
									{
										//  Create a new scope for the modal.
										var modalScope = (options.scope || $rootScope).$new();
										modalScope.type = type;

										modalScope.data = data;
										modalScope.callback = callback;
										modalScope.closeCallback = closeCallback;

										//  Create the inputs object to the controller - this will include
										//  the scope, as well as all inputs provided.
										//  We will also create a deferred that is resolved with a provided
										//  close function. The controller can then call 'close(result)'.
										//  The controller can also provide a delay for closing - this is
										//  helpful if there are closing animations which must finish first.
										var closeDeferred = $q.defer();
										var closedDeferred = $q.defer();
										var inputs = {
											$scope: modalScope,
											close: function(result, delay)
											{
												if (delay === undefined || delay === null)
													delay = 0;
												$timeout(function()
													{
														//  Resolve the 'close' promise.
														closeDeferred.resolve(result);

														//  Remove element from the DOM.
														modalElement.remove();

														//  Resolve the 'closed' promise.
														closedDeferred.resolve(result);

														//  We can now clean up the scope
														modalScope.$destroy();

														//  Unless we null out all of these objects we seem to suffer
														//  from memory leaks, if anyone can explain why then I'd
														//  be very interested to know.
														inputs.close = null;
														deferred = null;
														closeDeferred = null;
														modal = null;
														inputs = null;
														modalElement = null;
														modalScope = null;
													},
													delay);
											}
										};

										//  If we have provided any inputs, pass them to the controller.
										if (options.inputs)
											angular.extend(inputs, options.inputs);

										KeyboardNavigationSvc.init();

										//  Compile then link the template element, building the actual element.
										//  Set the $element on the inputs so that it can be injected if required.
										var linkFn = $compile(template);
										var modalElement = linkFn(modalScope);
										inputs.$element = modalElement;

										//  Create the controller, explicitly specifying the scope to use.
										var controllerObjBefore = modalScope[options.controllerAs];
										var modalController = $controller(options.controller, inputs, false, options.controllerAs);

										if (options.controllerAs && controllerObjBefore)
											angular.extend(modalController, controllerObjBefore);

										// append to body when no custom append element is specified
										appendChild(body, modalElement);

										modalScope.element = modalElement;

										//  We now have a modal object...
										var modal = {
											controller: modalController,
											scope: modalScope,
											element: modalElement,
											close: closeDeferred.promise,
											closed: closedDeferred.promise
										};

										//  ...which is passed to the caller via the promise.
										deferred.resolve(modal);
									})
									.then(null,
										function(error)
										{ // 'catch' doesn't work in IE8.
											deferred.reject(error);
										});

								return deferred.promise;
							};

							return modalObject;
						};
					}

					return new ModalService();
				}
			])
			.controller('OMWOfflineStoryCtrl',
			[
				'$scope', '$http', 'close', function ($scope, $http, close)
				{
					$scope.close = function (param)
					{
						close();
					};

					var baseUrl = $("#hdnAppBaseUrl").val();

					var storyId = OMWLocalStorage.GetCurrentStoryId();
					var stories = OMWLocalStorage.LoadStories();
					var localStory = OMWLocalStorage.FindStory(stories, storyId);
					if (!localStory)
						return;

					$scope.loadServerStory = function()
					{
						$scope.showLoadingAnimation = true;

						$http({
							url: baseUrl + "Story/EditStory/GetStoryHtmlText",
							method: 'POST',
							data: { id: storyId }
						}).then(function(data)
							{
								if (!!data && !!data.data)
									$scope.serverStory = extractHtml(data.data.Text);

								$scope.showLoadingAnimation = false;
							},
							function(err)
							{
								alert(!!err ? err.statusText : 'Error');
								$scope.showLoadingAnimation = false;
							});
					};

					$scope.copyToClipboard = function()
					{
						var text = localStory.Text;

						var $temp = $("<input>");
						$("body").append($temp);
						$temp.val(text).select();
						document.execCommand("copy");
						$temp.remove();
					};

					$scope.keepServerVersion = function ()
					{
						OMWLocalStorage.ClearStory(storyId);

						$scope.close();
					};

					$scope.keepLocalVersion = function ()
					{
						$scope.showLoadingAnimation = true;

						var text = escape(localStory.Text);
						var params = { storyId: storyId, fieldId: 0, fieldValue: 0, htmlUpdated: true, html: text };

						$http({
							url: baseUrl + 'Story/EditStory/SaveStory',
							method: 'POST',
							data: params
						}).then(function(data)
							{
								$scope.showLoadingAnimation = false;

								OMWLocalStorage.ClearStory(storyId);

							window.location.reload();

								$scope.close();
							},
							function(err)
							{
								alert(!!err ? err.statusText : 'Error');
								$scope.showLoadingAnimation = false;
							});
					};

					function extractHtml(html)
					{
						if (!!html && html.indexOf('<html>') === 0)
							return /<body.*?>([\s\S]*)<\/body>/.exec(html)[1];

						return "";
					}

					$scope.localStory = extractHtml(localStory.Text);
					$scope.serverStory = "";

					$scope.loadServerStory();
				}
			]);
}());