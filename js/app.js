$(function() {
	var _app = {

		/**
		 * [goPageByIndex 切屏]
		 * @param  {[type]} index [description]
		 * @return {[type]}       [description]
		 */
		goPageByIndex: function(index) {
			$('.page').eq(index).addClass('_on').siblings('._on').removeClass('_on');
		},

		/**
		 * [createInputByJsonTpl 通过json模版，创建输入框]
		 * @param  {[type]} data [description]
		 * @return {[type]}      [description]
		 */
		createInputByJsonTpl: function(data) {
			if (!data) {
				return;
			}
			var html = "";
			for (name in data) {
				var val = data[name];
				html += '<label>' + val + '</label>'
				html += '<textarea name="' + name + '" placeholder="' + val + '"></textarea>';
			}
			$('#inputArea').append(html);

			this.goPageByIndex(1);
		},
		/**
		 * [makeFileByString 根据字符串生成文件]
		 * @param  {[strong]} outPut [需要输出的字符串文件]
		 */
		makeFileByString: function(outPut) {
			saveAs(
				new Blob(
					[outPut], {
						type: "text/plain;charset=" + document.characterSet
					}
				), "index.html"
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
				outData[it.name] = it.value;
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
		 * [preview 预览]
		 * @return {[type]} [description]
		 */
		preview: function() {
			var formData = $('#jsonForm').serializeArray();
			var outData = this.serialize(formData);
			this.loadFileById('htmlTpl', function(ret) {
				var outPut = _.template(ret)(outData);
				$('#outArea').val(outPut);
				$('#htmlForm').removeClass('hide');
			});
		},
		/**
		 * [init 初始化]
		 * @return {[type]} [description]
		 */
		init: function() {

			var _it = this;

			//选择文件上传
			$('.j_file').on('change', function() {
				$(this).prev('strong').text(this.value);
			});

			//监听json模版输入表单
			$('#jsonTplForm').on('submit', function(e) {
				e.preventDefault();
				_it.loadFileById('jsonTpl', function(ret) {
					_it.createInputByJsonTpl(JSON.parse(ret));
				});
			});

			//监听json输入表单
			$('#jsonForm').on('submit', function(e) {
				e.preventDefault();
				var data = $(this).serializeArray();
				var serData = _it.serialize(data)
				_it.createOutput(serData);
			});

			//点击预览
			$('#htmlPre').on('click', function(e) {
				e.preventDefault();
				_it.preview();
			});

			//下载文件
			$('#htmlForm').on('submit', function(e) {
				e.preventDefault();
				var outPut = $('#outArea').val();
				_it.makeFileByString(outPut);
			});

		}
	};
	_app.init();
});