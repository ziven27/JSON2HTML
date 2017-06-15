$(function() {
	var _app = {

		reg: /<%=([^%>]+)?%>/g, //模版正则
		/**
		 * [goPageByIndex 切屏]
		 * @param  {[int]} index [description]
		 */
		goPageByIndex: function(index) {
			$('.page').eq(index).addClass('_on').siblings('._on').removeClass('_on');
		},
		/**
		 * [getDomByKeyVal 根据键值对生成html]
		 * @param  {[string]} key [key]
		 * @param  {[string]} val [val]
		 * @return {[string]}   [html]
		 */
		getDomByKeyVal: function(key, val) {
			var html = '<tr>'
			html += '<td class="input-label">' + val + '</td>';
			html += '<td class="input-control">';
			if (key.charAt(3) === '*') {
				html += '<textarea required name="' + key + '" placeholder="' + val + '"></textarea>';
			} else {
				html += '<input required type="text" name="' + key + '" placeholder="' + val + '" />'
			}
			html += '</td><tr/>';
			return html;
		},
		/**
		 * [getTplDataByUserInput 根据用户输入得到数据模版]
		 * @return {[type]} [{}]
		 */
		getTplDataByUserInput: function() {
			var formData = $('#jsonForm').serializeArray();
			var data = this.serialize(formData);
			return data;
		},
		/**
		 * [createInputByJsonTpl 通过json模版，创建输入框]
		 * @param  {[type]} data [description]
		 * @return {[type]}      [description]
		 */
		createInputByJsonTpl: function(data) {
			var _it = this;
			if (!data) {
				return false;
			}

			//递归遍历整个数据
			var recursion = function(d) {
				var html = '<table class="m-input">';
				for (key in d) {
					var val = d[key];
					if (typeof val === "object") {
						recursion(val);
					} else {
						html += _it.getDomByKeyVal(key, val);
					}
				}
				html += "</table>";
				return html;
			};
			var html = recursion(data);
			$('#inputArea').append(html);
			this.goPageByIndex(1);
		},
		/**
		 * [makeFileByString 根据字符串生成文件]
		 * @param  {[string]} outPut [需要输出的字符串文件]
		 */
		makeFileByString: function(outPut, fileName) {
			saveAs(
				new Blob(
					[outPut], {
						type: "text/plain;charset=" + document.characterSet
					}
				), fileName || "index.html"
			);
		},
		/**
		 * [createOutput 生成对应的html文件]
		 * @param  {[type]} data [description]
		 * @return {[type]}      [description]
		 */
		createOutput: function(data) {
			var _it = this;
			this.loadFileById('htmlTpl', function(ret) {
				var outPut = _.template(ret)(data);
				_it.makeFileByString(outPut);
			});
		},
		/**
		 * [serialize 将serializeArray序列化为键值对]
		 * @param  {[type]} data [serializeArray]
		 * @return {[type]}      [键值对]
		 */
		serialize: function(data) {
			//序列化
			var outData = {};
			for (var item in data) {
				var it = data[item];
				outData[it.name.toString()] = it.value;
			}
			return outData;
		},
		/**
		 * [loadFileById html5的方式读取文件]
		 * @param  {[type]}   id       [文件ID]
		 * @param  {Function} callback [读取成功之后执行的事情]
		 */
		loadFileById: function(id, callback) {
			var selectedFile = document.getElementById(id).files[0];
			var reader = new FileReader();
			reader.readAsText(selectedFile);
			reader.onload = function() {
				callback(this.result);
			};
		},
		/**
		 * [getJsonTplByHtmlTpl 根据html模版生成数据模版]
		 * @param  {[string]} tpl [description]
		 * @return {[{}}]}     [description]
		 */
		getJsonTplByHtmlTpl: function(tpl) {
			var _it = this;
			var re = _it.reg;
			var data = {};
			var match = true;
			while (match = re.exec(tpl)) {
				data[match[0]] = $.trim(match[1]);
			}
			return data;
		},
		html2Escape:function(sHtml) {
		 return sHtml.replace(/[<>&"]/g,function(c){return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c];});
		},
		/**
		 * [getHtmlByData 根据数据，渲染html]
		 * @param  {[{}]} data [description]
		 * @return {[string]}      [html]
		 */
		getHtmlByData: function(data) {
			var _it = this;
			var htmlTpl = _it.htmlTplFileString;
			var re = _it.reg;
			var match = true;
			while (match = re.exec(htmlTpl)) {
				var key = match[0];
				var userInput = $.trim(data[key]);
				if (!userInput) {
					continue;
				}
				userInput=_it.html2Escape(userInput);
				var name = match[1];
				if (name.charAt(0) === '*') {
					userInput = '<p>' + userInput.split('\n').join('</p><p>') + '</p>';
				}
				htmlTpl = htmlTpl.replace(key, userInput);
			}
			return htmlTpl;
		},
		/**
		 * [renderInputByData 上传数据模版，渲染到输入框内]
		 * @param  {[type]} data [description]
		 * @return {[type]}      [description]
		 */
		renderInputByData: function(data) {
			for (var key in data) {
				var val = data[key];
				if (val && val != '') {
					$('[name="' + key + '"]').val(val);
				}
			}
		},
		/**
		 * [init 初始化]
		 * @return {[type]} [description]
		 */
		init: function() {
			var _it = this;

			//点击上传html模版按钮
			$('#htmlTpl').on('change', function() {
				_it.loadFileById('htmlTpl', function(ret) {
					_it.htmlTplFileString = ret;
					var data = _it.getJsonTplByHtmlTpl(ret);
					_it.createInputByJsonTpl(data);
				});
			});

			//根据输入渲染html页面
			$('#jsonForm').on('submit', function(e) {
				e.preventDefault();
				var data = _it.getTplDataByUserInput();
				var html = _it.getHtmlByData(data);
				_it.makeFileByString(html);
			});

			//点击预览
			$('#htmlPre').on('click', function(e) {
				e.preventDefault();
				var data = _it.getTplDataByUserInput();
				var html = _it.getHtmlByData(data);
				$('#outArea').val(html);
				$('#htmlForm').removeClass('hide');
			});

			//下载预览输入框内的文件
			$('#htmlForm').on('submit', function(e) {
				e.preventDefault();
				var outPut = $('#outArea').val();
				_it.makeFileByString(outPut);
			});

			//下载数据模版
			$('#downLoadDataTpl').on('click', function(e) {
				e.preventDefault();
				var data = _it.getTplDataByUserInput();
				_it.makeFileByString(JSON.stringify(data), 'data.json');
			});

			//上传数据模版
			$('#upLoadDataTpl').on('change', function(e) {
				e.preventDefault();
				_it.loadFileById('upLoadDataTpl', function(ret) {
					var data = JSON.parse(ret);
					_it.renderInputByData(data);
				});
			});
		}
	};
	_app.init();
});