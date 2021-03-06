/**
 * 全局参数表管理
 * 
 */
Ext.onReady(function() {

	var sm = new Ext.grid.CheckboxSelectionModel();
	var cm = new Ext.grid.ColumnModel([ new Ext.grid.RowNumberer(), sm, {
		header : '配置编号',
		dataIndex : 'CONFIG_ID',
		hidden : true
	}, {
		header : '作业名称',
		dataIndex : 'TASK_NAME',
		width : 120
	}, {
		id : 'TABLE_NAME',
		header : '表名',
		dataIndex : 'TABLE_NAME',
		width : 120,
		listeners:{ 
			   select:function(combo,record,opts) {  
				  var type = combo.getValue();
				  //alert(type);
			      if(type == 1){//是增量抽取
			    	  Ext.getCmp('p_INCREMENTFIELD').setDisabled(false);
			    	  Ext.getCmp('p_STARTTIME').setDisabled(false);
			      } else if(type == 0){//全量抽取
			    	  Ext.getCmp('p_INCREMENTFIELD').setValue('');
			    	  Ext.getCmp('p_STARTTIME').setValue('');
			    	  Ext.getCmp('p_INCREMENTFIELD').setDisabled(true);
			    	  Ext.getCmp('p_STARTTIME').setDisabled(true);
			      } 
			   }  
		}
	}, {
		header : '返回字段名称',
		dataIndex : 'FIELDS',
		width : 150
	}, {
		header : '结果分隔符',
		dataIndex : 'RESULT_SEP',
		width : 80
	}, {
		header : '是否增量抽取',
		dataIndex : 'IS_INCREMENT',
		renderer:function(v){
			if(v == 1){
				return "是";
			} else if(v == 0){
				return "否";
			}
		},
		width : 80
	}, {
		header : '增量字段',
		dataIndex : 'INCREMENTFIELD',
		width : 120
		
	}, {
		header : '开始时间',
		dataIndex : 'STARTTIME',
		width : 150
		
	},{
		header : '是否定时任务',
		dataIndex : 'TASKTYPE',
		renderer:function(v){
			if(v == 1){
				return "是";
			} else if(v == 0){
				return "否";
			}
		},
		width : 80
	},  {
		id : 'CONDITIONS',
		header : '查询条件',
		dataIndex : 'CONDITIONS',
		width : 150
		
	}, {
		id : 'CREATETIME',
		header : '创建时间',
		dataIndex : 'CREATETIME',
		width : 150
	} ]);
	
	
	var addDatabase = new Ext.grid.ColumnModel([ new Ext.grid.RowNumberer(), sm, {
		header : '配置编号',
		dataIndex : 'CONFIG_ID',
		hidden : true
	}, {
		header : '作业名称',
		dataIndex : 'TASK_NAME',
		width : 120
	}, {
		id : 'TABLE_NAME',
		header : '数据源',
		dataIndex : 'TABLE_NAME',
		width : 120
    }, {
		header : '结果分隔符',
		dataIndex : 'RESULT_SEP',
		width : 80
	}, {
		id : 'CREATETIME',
		header : '创建时间',
		dataIndex : 'CREATETIME',
		width : 150
	} ]);

	/**
	 * 数据存储
	 */
	var store = new Ext.data.Store({
		proxy : new Ext.data.HttpProxy({
			url : '../dataExport/list.shtml'
		}),
		reader : new Ext.data.JsonReader({
			totalProperty : 'total',
			root : 'rows'
		}, [ {
			name : 'CONFIG_ID'
		}, {
			name : 'TASK_NAME'
		}, {
			name : 'TABLE_NAME'
		}, {
			name : 'FIELDS'
		}, {
			name : 'RESULT_SEP'
		}, {
			name : 'IS_INCREMENT'
		}, {
			name : 'INCREMENTFIELD'
		}, {
			name : 'STARTTIME'
		}, {
			name : 'CONDITIONS'
		}, {
			name : 'CREATETIME'
		},{
			name : 'TASKTYPE'
		} ])
	});

	// 翻页排序时带上查询条件
	store.on('beforeload', function() {
		
	});

	var pagesize_combo = new Ext.form.ComboBox({
		name : 'pagesize',
		hiddenName : 'pagesize',
		typeAhead : true,
		triggerAction : 'all',
		lazyRender : true,
		mode : 'local',
		store : new Ext.data.ArrayStore({
			fields : [ 'value', 'text' ],
			data : [ [ 10, '10条/页' ], [ 20, '20条/页' ], [ 50, '50条/页' ],
					[ 100, '100条/页' ], [ 250, '250条/页' ], [ 500, '500条/页' ] ]
		}),
		valueField : 'value',
		displayField : 'text',
		value : '50',
		editable : false,
		width : 85
	});
	
	var number = parseInt(pagesize_combo.getValue());
	pagesize_combo.on("select", function(comboBox) {
		bbar.pageSize = parseInt(comboBox.getValue());
		number = parseInt(comboBox.getValue());
		store.reload({
			params : {
				start : 0,
				limit : bbar.pageSize
			}
		});
	});

	var bbar = new Ext.PagingToolbar({
		pageSize : number,
		store : store,
		displayInfo : true,
		displayMsg : '显示{0}条到{1}条,共{2}条',
		plugins : new Ext.ux.ProgressBarPager(), // 分页进度条
		emptyMsg : "没有符合条件的记录",
		items : [ '-', '&nbsp;&nbsp;', pagesize_combo ]
	});

	var grid = new Ext.grid.GridPanel({
		title : '<span class="commoncss">数据集市数据导出作业配置信息列表</span>',
		iconCls : 'configIcon',
		height : 500,
		// width:600,
		autoScroll : true,
		region : 'center',
		store : store,
		loadMask : {
			msg : '正在加载表格数据,请稍等...'
		},
		stripeRows : true,
		frame : true,
		cm : cm,
		sm : sm,
		tbar : [ {
			text : '新增',
			iconCls : 'page_addIcon',
			handler : function() {
				addInit();
			}
		}, '-', {
			text : '修改',
			iconCls : 'page_edit_1Icon',
			handler : function() {
				editInit();
			}
		}, '-', {
			text : '删除',
			iconCls : 'page_delIcon',
			handler : function() {
				deleteParamItems();
			}
		}, '-', {
			text : '运行任务',
			iconCls : 'page_delIcon',
			handler : function() {
				runTask();
			}
		}
//		, '-', {
//			text : '任务运行信息',
//			iconCls : 'page_delIcon',
//			handler : function() {
//				viewTaskInfo();
//			}
//		}
		],
		bbar : bbar
	});
	store.load({
		params : {
			start : 0,
			limit : bbar.pageSize
		}
	});
	grid.on('rowdblclick', function(grid, rowIndex, event) {
		editInit();
	});
	grid.on('sortchange', function() {
		// grid.getSelectionModel().selectFirstRow();
	});

	bbar.on("change", function() {
		// grid.getSelectionModel().selectFirstRow();
	});
	

	
	
	var column_store = new Ext.data.JsonStore({  
	    autoLoad: true,  
	    url : '../dataExport/getReturnField.shtml?table_id=0',
	    fields  : [  
	        {name: 'COLUMN_NAME'},  
	        {name: 'COLUMN_NAME'}  
	    ]
	});
	
	var paramName_edit = new Ext.form.ComboBox({
		name : 'ParamName',
		hiddenName : 'p_ParamName',
   		typeAhead : true,
   		triggerAction : 'all',
   		mode : 'local',
   		store : column_store,
   		displayField : 'COLUMN_NAME',
   		valueField : 'COLUMN_NAME'
   	});
	

	var data_combox = [ [ '=', '=' ], [ '!=', '!=' ], [ '<', '<' ],
			[ '>', '>' ], [ '<=', '<=' ], [ '>=', '>=' ] ];

    // 第二步：导入到store中：
	var sign_combox = new Ext.data.SimpleStore({
		fields : [ 'sign_value', 'sign_text' ],
		data : data_combox
	});
      

	var sign_edit = new Ext.form.ComboBox({
		name : 'ParamSign',
		hiddenName : 'p_ParamSign',
		typeAhead : true,
		triggerAction : 'all',
		mode : 'local',
		store : sign_combox,
		displayField : 'sign_text',
		valueField : 'sign_value'
	});
   	
   	var paramValue_edit =  new Ext.form.TextField();
   	
	var condition_combox = [ [ 'and', 'and' ], [ 'or', 'or' ] ];
	var condition_store = new Ext.data.SimpleStore({
		fields : [ 'condition_value', 'condition_text' ],
		data : condition_combox
	});
     
  	var paramCondition_edit = new Ext.form.ComboBox({
  		name :'ParamCondition',
  		hiddenName : 'p_ParamCondition',
  		typeAhead : true,
  		triggerAction : 'all',
  		mode : 'local',
  		store : condition_store,
  		displayField : 'condition_text',
  		valueField : 'condition_value'
  	});
	
   	var data = [];
	var ds = new Ext.data.Store({
		proxy : new Ext.data.MemoryProxy(data),
		reader : new Ext.data.ArrayReader({}, [ {
			name : 'ParamName'
		}, {
			name : 'ParamSign'
		}, {
			name : 'ParamValue'
		}, {
			name : 'ParamCondition'
		} ])
	});
	ds.load();
	
	var grid1 = new Ext.grid.EditorGridPanel({
//		title : '创建表',
		autoScroll : true,
		tbar: [{text:'添加查询条件',
				iconCls : 'page_addIcon',
				handler: add_row
			   }
			  ], 
//		renderTo : document.body,
		frame : true,
		//cm : cm,
//		sm : sm,
		height : 400,
		width : 300,
		clickstoEdit : 1,
		store : ds,
		loadMask : {
			msg : '正在加载表格数据,请稍等...'
		},
		columns : [
		{
			header : "字段名称",
			dataIndex : 'ParamName',
			editor : paramName_edit,
			width : 100
		},{
			header : "条件符号",
			dataIndex : 'ParamSign',
			editor : sign_edit,
			width : 70
		},{
			header : "字段值",
			dataIndex : 'ParamValue',
			editor : paramValue_edit,
			width : 80
		},{
			header : "字段关系符号",
			dataIndex : 'ParamCondition',
			editor : paramCondition_edit,
			width : 100
		}
		]
//		listeners: {   
//			afteredit: function(e){    
//			if (e.field == 'name' && e.value == 'Mel Gibson'){     
//				Ext.Msg.alert('Error','Mel Gibson movies not allowed');      
//				e.record.reject();     
//				}else{     
//					e.record.commit();     
//				}    
//			}   
//		} 
	});
	
	var ds_model = Ext.data.Record.create([
       	'ParamName',                                  
       	'ParamSign',
       	'ParamValue',
       	'ParamCondition'
       	]);  

	function add_row() {
		grid1.getStore().insert(grid1.getStore().getCount(), new ds_model({
			ParamName : '',
			ParamSign : '',
			ParamValue : '',
			ParamCondition : ''
		}));
		grid1.startEditing(grid1.getStore().getCount() - 1, 0);

	} 
	
	function remove_row(){
		grid1.getStore().removeAll();
	}

	
	
	
	
	// var incComboData = [ [ 0, '否' ], [ 1, '是' ]];
	var incComboData = [ [  '否',0 ], [ '是', 1 ]];
	var incCombo = new Ext.form.ComboBox({
		store : new Ext.data.SimpleStore({
			fields : [ "IS_INCREMENT", "IS_INCREMENT_NAME" ],
			data : incComboData
		}),
//		valueField : "IS_INCREMENT",
//		displayField : "IS_INCREMENT_NAME",
		valueField : "IS_INCREMENT_NAME",
		displayField : "IS_INCREMENT",
		mode : 'local',
		forceSelection : true,
		hiddenName : 'p_IS_INCREMENT',
		emptyText : '',
		editable : false,
		value : 0,
		triggerAction : 'all',
		fieldLabel : '是否增量抽取',
		allowBlank : false,
		anchor : '99%',
		name : 'p_IS_INCREMENT',
		listeners:{ 
			   select:function(combo,record,opts) {  
				  var type = combo.getValue();
				  //alert(type);
			      if(type == 1){//是增量抽取
			    	  Ext.getCmp('p_INCREMENTFIELD').setDisabled(false);
			    	  Ext.getCmp('p_STARTTIME').setDisabled(false);
			      } else if(type == 0){//全量抽取
			    	  Ext.getCmp('p_INCREMENTFIELD').setValue('');
			    	  Ext.getCmp('p_STARTTIME').setValue('');
			    	  Ext.getCmp('p_INCREMENTFIELD').setDisabled(true);
			    	  Ext.getCmp('p_STARTTIME').setDisabled(true);
			      } 
			   }  
		}
	});

	
	var taskTypeComboData = [ [  '否',0 ], [ '是', 1 ]];
	var taskTypeCombo = new Ext.form.ComboBox({
		store : new Ext.data.SimpleStore({
			fields : [ "TASKTYPE_NAME", "TASKTYPE" ],
			data : taskTypeComboData
		}),
//		valueField : "IS_INCREMENT",
//		displayField : "IS_INCREMENT_NAME",
		valueField : "TASKTYPE",
		displayField : "TASKTYPE_NAME",
		mode : 'local',
		forceSelection : true,
		hiddenName : 'p_TASKTYPE',
		emptyText : '',
		editable : false,
		value : 0,
		triggerAction : 'all',
		fieldLabel : '是否定时任务',
		allowBlank : false,
		anchor : '99%',
		name : 'p_TASKTYPE'
	});
	
	
	
	var checktable = new Ext.form.ComboBox({
		fieldLabel : '表名',
		name : 'p_TABLE_NAME',
		forceSelection : true,
		hiddenName : 'p_TABLE_NAME',
		//hiddenValue:'table_id',
		anchor : '99%',
		store : new Ext.data.JsonStore({
			fields : [ 'table_id', 'tableName' ],
			url : '../dataExport/getTable.shtml',
			autoLoad : true
		}),
		valueField : 'tableName',
		displayField : 'tableName',
		typeAhead : true,
		mode : 'local',
		triggerAction : 'all',
		selectOnFocus : false,// 设置用户能不能自己输入,true为只能选择列表中有的记录
		allowBlank : false,
		listeners:{ 
			   select:function(combo,record,opts) {  
			   	  var table_id = combo.getStore().getAt(combo.selectedIndex).data.table_id;
		           //alert("table_id="+table_id);
				  //var table_id = combo.getValue();
//				  var tableName = combo.getValueField();
				  //Ext.MessageBox.alert('提示', tableName +"table_id:"+record.table_id);
				  reLoadData(table_id);
			   }  
			  }  
	});
	
	
//	var formStore = [];
	var formStore = new Ext.data.JsonStore({  
	    autoLoad: true,  
	    url : '../dataExport/getReturnField.shtml?table_id=0',
	    fields  : [  
	        {name: 'COLUMN_NAME'},  
	        {name: 'COLUMN_NAME'}  
	    ]
	});
	
	function reLoadData(table_id){
		returnFields.reset();
		formStore.proxy=new Ext.data.HttpProxy({url:'../dataExport/getReturnField.shtml?table_id='+table_id});
		formStore.load();
		
		paramName_edit.reset();
		column_store.proxy=new Ext.data.HttpProxy({url:'../dataExport/getReturnField.shtml?table_id='+table_id});
		column_store.load();
	}
	
	var returnFields = new Ext.ux.form.LovCombo({
		  name:'p_FIELDS',
		  fieldLabel:'返回字段',
		  store:formStore,
		  mode:'local',
		  triggerAction:'all',
		  hiddenName : 'p_FIELDS',
		  hideTrigger:false,
		  allowBlank:true,
		  displayField:'COLUMN_NAME',
		  valueField:'COLUMN_NAME',
		  emptyText:'请选择返回字段...',
		  editable:false,
		  anchor : '99%',
		  showSelectAll : true,  
		  resizable   : true 
	});
	


/*	var addParamFormPanel = new Ext.form.FormPanel({
		id : 'addParamFormPanel',
		name : 'addParamFormPanel',
//		defaultType : 'textfield',
		labelAlign : 'left',
		bodyStyle : 'padding:5px',
		labelWidth : 100,
		frame : true,
		width : 750,
		layout : 'column',
		items : [{	
					columnWidth : 0.5,
					xtype : 'fieldset',
//					title : '运行信息配置',
					labelWidth : 90,
					defaults : {
						width : 140,
						border : true
					},
					defaultType : 'textfield',
					autoHeight : true,
					bodyStyle : Ext.isIE ? 'padding:0 0 5px 15px;'
							: 'padding:10px 15px;',
					border : false,
					items : [{
					fieldLabel : '配置名称',
					name : 'p_TASK_NAME',
					id : 'p_TASK_NAME',
					allowBlank : false,
					anchor : '99%'
				}, checktable
				, incCombo,{
					fieldLabel : '增量字段',
					name : 'p_INCREMENTFIELD',
					id : 'p_INCREMENTFIELD',
					allowBlank : true,
					anchor : '99%'
				},{
					xtype:"datetimefield",
					format:'H:i',
					fieldLabel : '开始时间',
					name : 'p_STARTTIME',
					id : 'p_STARTTIME',
					allowBlank: true,
					anchor : '99%'
				},taskTypeCombo,{
					fieldLabel : '结果分隔符',
					name : 'p_RESULT_SEP',
					id : 'p_RESULT_SEP',
					allowBlank : false,
					anchor : '99%'
				}, {
					fieldLabel : '查询条件',
					name : 'p_CONDITIONS',
					id : 'p_CONDITIONS',
					anchor : '99%',
					readOnly:'true'
				},  
		//		{
		//			fieldLabel : '返回字段',
		//			name : 'p_FIELDS',
		//			id : 'myCombo',  
		//			anchor : '99%',
		//			store : fieldStore
		//			
		//			store : '',
		//			valueField : 'FIELDS',
		//			displayField : 'FIELDS',
		//			typeAhead : true,
		//			mode : 'local',
		//			triggerAction : 'all',
		//			selectOnFocus : true,// 用户不能自己输入,只能选择列表中有的记录
		//			allowBlank : false
		//		},
				returnFields,
				{
					id : 'p_CONFIG_ID',
					name : 'p_CONFIG_ID',
					hidden : true
				}, {
					id : 'windowmode',
					name : 'windowmode',
					hidden : true
				} ]
		     },
//		     {
//					columnWidth : 0.10,
//					layout : 'fit',
//					items : [job_param_grid]
//			 },
		     {
					columnWidth : 0.50,
					layout : 'fit',
					items : [grid1]
			 }
		]
	});
	*/
	//
	 
	var addParamFormPanel = new Ext.form.FormPanel({
		id : 'addParamFormPanel',
		name : 'addParamFormPanel',
//		defaultType : 'textfield',
		labelAlign : 'left',
		bodyStyle : 'padding:5px',
		labelWidth : 100,
		frame : true,
		width : 750,
		layout : 'column',
		items : [{	
					columnWidth : 0.5,
					xtype : 'fieldset',
//					title : '运行信息配置',
					labelWidth : 90,
					defaults : {
						width : 140,
						border : true
					},
					defaultType : 'textfield',
					autoHeight : true,
					bodyStyle : Ext.isIE ? 'padding:0 0 5px 15px;'
							: 'padding:10px 15px;',
					border : false,
					items : [{
					fieldLabel : '配置名称',
					name : 'p_TASK_NAME',
					id : 'p_TASK_NAME',
					allowBlank : false,
					anchor : '99%'
				}, checktable
				, incCombo,{
					fieldLabel : '增量字段',
					name : 'p_INCREMENTFIELD',
					id : 'p_INCREMENTFIELD',
					allowBlank : true,
					anchor : '99%'
				},{
					xtype:"datetimefield",
					format:'H:i',
					fieldLabel : '开始时间',
					name : 'p_STARTTIME',
					id : 'p_STARTTIME',
					allowBlank: true,
					anchor : '99%'
				},taskTypeCombo,{
					fieldLabel : '结果分隔符',
					name : 'p_RESULT_SEP',
					id : 'p_RESULT_SEP',
					allowBlank : false,
					anchor : '99%'
				}, {
					fieldLabel : '查询条件',
					name : 'p_CONDITIONS',
					id : 'p_CONDITIONS',
					anchor : '99%',
					readOnly:'true'
				},  
				returnFields,
				{
					id : 'p_CONFIG_ID',
					name : 'p_CONFIG_ID',
					hidden : true
				}, {
					id : 'windowmode',
					name : 'windowmode',
					hidden : true
				} ]
		     },
		     {
					columnWidth : 0.50,
					layout : 'fit',
					items : [grid1]
			 }
		]
	});
	var databaseTitle = new Ext.form.Label({
		text:'数据源'
	});
	var addParamWindow = new Ext.Window({
		width : 740,
		height : 400,
		layout : 'fit',
		resizable : false,
		draggable : true,
		closeAction : 'hide',
		title : '<span class="commoncss">新增数据导出作业配置</span>',
		modal : true,
		collapsible : true,
		titleCollapse : true,
		maximizable : false,
		buttonAlign : 'right',
		border : false,
		animCollapse : true,
		pageY : 20,
		//pageX : document.body.clientWidth / 2 - 420 / 2,
		animateTarget : Ext.getBody(),
		constrain : true,
		items : [ addParamFormPanel ],
		buttons : [ {
			text : '保存',
			iconCls : 'acceptIcon',
			handler : function() {
				var mode = Ext.getCmp('windowmode').getValue();
				if (mode == 'add')
					saveParamItem();
				else
					updateParamItem();
			}
		}, {
			text : '重置',
			id : 'btnReset',
			iconCls : 'tbar_synchronizeIcon',
			handler : function() {
				clearForm(addParamFormPanel.getForm());
			}
		}, {
			text : '关闭',
			iconCls : 'deleteIcon',
			handler : function() {
				addParamWindow.hide();
				remove_row();
			}
		} ]
	});
	


	/**
	 * 布局
	 */
	var viewport = new Ext.Viewport({
		layout : 'border',
		items : [ grid ]
	});


	var typeComboData = [ [1, '时间间隔(秒)' ],[2, '时间间隔(分钟)' ],[ 3, '天' ], [ 4, '月' ], [ 5, '周' ]];
	typeCombo = new Ext.form.ComboBox({
		store : new Ext.data.SimpleStore({
			fields : [ "scheduletype", "scheduletypeName" ],
			data : typeComboData
		}),
		valueField : "scheduletype",
		displayField : "scheduletypeName",
		mode : 'local',
		forceSelection : true,
		value : "",
		hiddenName : 'scheduletype',
		allowBlank : false,
		editable : false,
		triggerAction : 'all',
		fieldLabel : '调度类型',
//		autoWidth : true,
		anchor : '80%',
		name : 'scheduletype',
		listeners:{ 
			   select:function(combo,record,opts) {  
				  var type = combo.getValue();
				 
			      if(type == 1){//时间间隔（秒）
			    	  Ext.getCmp('p_SECOND').setDisabled(false);
			    	  Ext.getCmp('p_MINUTE').setDisabled(true);
			    	  Ext.getCmp('p_HOUR').setDisabled(true);
			    	  weekCombo.disable();
			    	  monthCombo.disable();
			      } else if(type == 2){//时间间隔（分钟）
			    	  Ext.getCmp('p_SECOND').setDisabled(true);
			    	  Ext.getCmp('p_MINUTE').setDisabled(false);
			    	  Ext.getCmp('p_HOUR').setDisabled(true);
			    	  weekCombo.disable();
			    	  monthCombo.disable();
			    	  //Ext.getCmp('p_VERYMONTH').setDisabled(true);
			      } else if(type == 3){//按天运行
			    	  Ext.getCmp('p_SECOND').setDisabled(true);
			    	  Ext.getCmp('p_MINUTE').setDisabled(true);
			    	  Ext.getCmp('p_HOUR').setDisabled(false);//=true;
					  weekCombo.disable();
					  monthCombo.disable();
			      	  
			      } else if(type == 4){//每月
			    	  Ext.getCmp('p_SECOND').setDisabled(true);
			    	  Ext.getCmp('p_MINUTE').setDisabled(true);
					  Ext.getCmp('p_HOUR').setDisabled(false);//=true;
					  weekCombo.disable();
					  monthCombo.enable();
			      } else if(type == 5){//每周
			    	  Ext.getCmp('p_SECOND').setDisabled(true);
			    	  Ext.getCmp('p_MINUTE').setDisabled(true);
			     	  Ext.getCmp('p_HOUR').setDisabled(false);//=true;
			     	  weekCombo.enable();
			     	  monthCombo.disable();
			      } 
			    
			   }  
			  }  
	});
	
	//周有效值 1到 7
	var weekComboData = [ [ 2, '星期一' ], [ 3, '星期二' ],[ 4, '星期三' ], [ 5, '星期四' ],[ 6, '星期五' ],[ 7, '星期六' ],[ 1, '星期天' ]];
	weekCombo = new Ext.form.ComboBox({
		store : new Ext.data.SimpleStore({
			fields : [ "p_VERYWEEK", "p_WEEKNAME" ],
			data : weekComboData
		}),
		valueField : "p_VERYWEEK",
		displayField : "p_WEEKNAME",
		mode : 'local',
		forceSelection : true,
		value : '',
		hiddenName : 'p_VERYWEEK',
		editable : false,
		disabled : true,
		triggerAction : 'all',
		fieldLabel : '每周',
//		autoWidth : true,
		anchor : '80%',
		name : 'p_VERYWEEK'
	});
	
	 //月份有效值 0 到 11
	 //var jobsmonthData = [ [ 0, '1' ], [ 1, '2' ],[ 2, '3' ], [ 3, '4' ],[ 4, '5' ],[ 5, '6' ],[ 6, '7' ],[ 7, '8' ],[ 8, '9' ], [ 9, '10' ],[ 10, '11' ], [ 11, '12' ]];
	var monthData = [ [ 1, '1' ], [ 2, '2' ],[ 3, '3' ], [ 4, '4' ],[ 5, '5' ],[ 5, '6' ],[ 7, '7' ],[ 8, '8' ],[ 9, '9' ], [ 10, '10' ],[ 11, '11' ], [ 12, '12' ],[ 13, '13' ],[14, '14' ],[15, '15' ],[16, '16' ], [17, '17' ],[18, '18' ], [19, '19' ],[21, '21' ],[22, '22' ],[23, '23' ],[ 24, '24' ], [ 25, '25' ],[ 26, '26' ], [ 27, '27' ],[28, '28' ],[ 29, '29' ],[ 30, '30' ],[ 31, '31' ]];
	monthCombo = new Ext.form.ComboBox({
		store : new Ext.data.SimpleStore({
			fields : [ "p_VERYMONTH", "p_VERYMONTHNAME" ],
			data : monthData
		}),
		valueField : "p_VERYMONTH",
		displayField : "p_VERYMONTHNAME",
		mode : 'local',
		forceSelection : true,
		value :'',
		hiddenName : 'p_VERYMONTH',
		editable : false,
		disabled : true,
		triggerAction : 'all',
		fieldLabel : '每月',
//		autoWidth : true,
		anchor : '80%',
		name : 'p_VERYMONTH'
	});
	
	var runTaskFormPanel = new Ext.form.FormPanel({
		title : '配置运行任务名称',
		id : 'runTaskFormPanel',
		name : 'runTaskFormPanel',
		defaultType : 'textfield',
		labelAlign : 'right',
		labelWidth : 90,
		frame : false,
		bodyStyle : 'padding:5 5 0',
		items : [ 
		{
			fieldLabel : '任务名称',
			name : 'p_TASKNAME',
			id : 'p_TASKNAME',
			anchor : '80%',
			allowBlank : false,
			value : ''
		},{
			fieldLabel : '任务类型',
			name : 'p_TIMEDTASK',
			id : 'p_TIMEDTASK',
			anchor : '80%',
			allowBlank : false,
			value : ''
		},typeCombo,{
			fieldLabel : '以秒计算的时间间隔(0-59)',
			name : 'p_SECOND',
			id : 'p_SECOND',
			allowBlank : false,
			editable : false,
			disabled : true,
			anchor : '80%',
			value : 0
		}, {
			fieldLabel : '以分钟计算的时间间隔(0-59)',
			name : 'p_MINUTE',
			id : 'p_MINUTE',
			editable : false,
			disabled : true,
			anchor : '80%',
			value : 0
		},{
			fieldLabel : '每天',
			name : 'p_HOUR',
			id : 'p_HOUR',
			allowBlank : false,
			anchor : '80%',
			value : '00:00'
		},weekCombo,monthCombo,
		{
			id : 'jobName',
			name : 'jobName',
			hidden : true
		},{
			id : 'jobConfigId',
			name : 'jobConfigId',
			hidden : true
		}, {
			id : 'result_sep',
			name : 'result_sep',
			hidden : true
		}, {
			id : 'fields',
			name : 'fields',
			hidden : true
		}, {
			id : 'table_name',
			name : 'table_name',
			hidden : true
		}, {
			id : 'conditions',
			name : 'conditions',
			hidden : true
		}, {
			id : 'task_type',
			name : 'task_type',
			hidden : true
		}, {
			id : 'type_value',
			name : 'type_value',
			hidden : true
		}, {
			id : 'increment',
			name : 'increment',
			hidden : true
		}, {
			id : 'incrementField',
			name : 'incrementField',
			hidden : true
		}]
	});

	var runTaskWindow = new Ext.Window({
		layout : 'fit',
//		width : 500,
//		height : 300,
		width : 400,
		height : 400,
		resizable : false,
		draggable : true,
		closeAction : 'hide',
		title : '<span class="commoncss">任务运行配置</span>',
		modal : true,
		collapsible : true,
		titleCollapse : true,
		maximizable : false,
		buttonAlign : 'right',
		border : false,
		animCollapse : true,
		pageY : 20,
		//pageX : document.body.clientWidth / 2 - 420 / 2,
		animateTarget : Ext.getBody(),
		constrain : true,
		items : [ runTaskFormPanel ],
		buttons : [ {
			text : '运行',
			iconCls : 'acceptIcon',
			handler : function() {
				runQuartzTask();
				
			}
		}, {
			text : '关闭',
			iconCls : 'deleteIcon',
			handler : function() {
				runTaskWindow.hide();
				runTaskFormPanel.form.reset();
				  Ext.getCmp('p_SECOND').setDisabled(true);
		    	  Ext.getCmp('p_MINUTE').setDisabled(true);
				  weekCombo.disable();
				  monthCombo.disable();
			}
		} ]
	});
	
	/**
	 * 运行任务
	 */
	function runTask(){
		var record = grid.getSelectionModel().getSelected();
		if (Ext.isEmpty(record)) {
			Ext.MessageBox.alert('提示', '请先选中要执行的任务');
			return;
		}
		var jobId = record.get("CONFIG_ID");
		var name = record.get("TASK_NAME");
		var task_type = record.get("TASKTYPE");
		Ext.getCmp('jobName').setValue(name);
		Ext.getCmp('jobConfigId').setValue(jobId);
		Ext.getCmp('task_type').setValue(task_type);
		Ext.getCmp('result_sep').setValue(record.get("RESULT_SEP"));
		Ext.getCmp('fields').setValue(record.get("FIELDS"));
		Ext.getCmp('table_name').setValue(record.get("TABLE_NAME"));
		Ext.getCmp('conditions').setValue(record.get("CONDITIONS"));		
		Ext.getCmp('type_value').setValue(record.get("STARTTIME"));
		Ext.getCmp('increment').setValue(record.get("IS_INCREMENT"));
		Ext.getCmp('incrementField').setValue(record.get("INCREMENTFIELD"));
		
		if(task_type=="0"){
			Ext.getCmp('p_TIMEDTASK').setValue("非定时任务");
			Ext.getCmp('p_TIMEDTASK').setDisabled(true);
			Ext.getCmp('p_HOUR').setDisabled(true);
			typeCombo.disable();
		}else if(task_type=="1"){
			Ext.getCmp('p_TIMEDTASK').setValue("定时任务");
			Ext.getCmp('p_TIMEDTASK').setDisabled(true);
			Ext.getCmp('p_HOUR').setDisabled(false);
			typeCombo.enable();
		}	
		runTaskWindow.show();
		runTaskWindow.setTitle('<span class="commoncss">任务运行信息配置</span>');
	}
	

	/**
	 * 新增参数初始化
	 */
	function addInit() {
		Ext.getCmp('btnReset').hide();
		var flag = Ext.getCmp('windowmode').getValue();
		if (typeof (flag) != 'undefined') {
			addParamFormPanel.form.getEl().dom.reset();
		} else {
			clearForm(addParamFormPanel.getForm());
		}
		remove_row();
		addParamWindow.show();
		addParamWindow.setTitle('<span class="commoncss">新增数据导出作业配置</span>');
		Ext.getCmp('windowmode').setValue('add');

	}

	function generateCondition(){
		//将添加的条件值拼起来赋值给查询条件p_CONDITIONS
		var param = " ";
		grid1.getStore().each(function(record){
			var name = record.get("ParamName");
			var sign = record.get("ParamSign");
			var value = record.get("ParamValue");
			var condition = record.get("ParamCondition");
			if(name != "" && value != "" && sign != ""){
				param += " "+name+sign+" \'"+value+"' ";
			}
			if(condition != ""){
				param +=condition;
			}
		});
		if(param != ""){
			param = param.substring(0,param.lastIndexOf(" "));
		}
		param +=" ";
		if(null!=param&&""!=param &&" "!=param){
			Ext.getCmp('p_CONDITIONS').setValue(param);
		}
	}
	
	/**
	 * 保存参数数据
	 */
	function saveParamItem() {
		
		generateCondition();
		addParamFormPanel.form.submit({
			url : '../dataExport/save.shtml',
			waitTitle : '提示',
			method : 'POST',
			waitMsg : '正在处理数据,请稍候...',
			success : function(form, action) {
				addParamWindow.hide();
				store.reload();
				form.reset();
				remove_row();
			},
			failure : function(form, action) {
				var msg = action.result.msg;
				Ext.MessageBox.alert('提示', '数据保存失败:<br>' + msg);
			}
		});
	}

	/**
	 * 删除参数
	 */
	function deleteParamItems() {
		var rows = grid.getSelectionModel().getSelections();
		if (Ext.isEmpty(rows)) {
			Ext.Msg.alert('提示', '请先选中要删除的项目!');
			return;
		}
		var strChecked = jsArray2JsString(rows, 'CONFIG_ID');
		Ext.Msg.confirm('请确认', '确认删除选中的配置任务信息吗?', function(btn, text) {
			if (btn == 'yes') {

				Ext.Ajax.request({
					url : '../dataExport/delete.shtml',
					success : function(response) {
						var resultArray = Ext.util.JSON
								.decode(response.responseText);
						store.reload();
						Ext.Msg.alert('提示', resultArray.msg);
					},
					failure : function(response) {
						var resultArray = Ext.util.JSON
								.decode(response.responseText);
						Ext.Msg.alert('提示', resultArray.msg);
					},
					params : {
						strChecked : strChecked
					}
				});
			}
		});
	}

	/**
	 * 修改参数初始化
	 */
	function editInit() {
		var record = grid.getSelectionModel().getSelected();
		if (Ext.isEmpty(record)) {
			Ext.MessageBox.alert('提示', '请先选中要修改的配置任务信息');
			return;
		}
		remove_row();
		var flag = record.get("IS_INCREMENT");//Ext.getCmp('p_IS_INCREMENT').getValue();
		if (flag !=null && flag == '0') {
			Ext.getCmp('p_INCREMENTFIELD').setValue(''); 
			Ext.getCmp('p_STARTTIME').setValue('');
		}
		var editRecord = Ext.data.Record.create( {
			name : 'p_TASK_NAME',
			mapping : 'TASK_NAME'
		}, {
			name : 'p_CONFIG_ID',
			mapping : 'CONFIG_ID'
		}, {
			name : 'p_TABLE_NAME',
			mapping : 'TABLE_NAME'
		}, {
			name : 'p_FIELDS',
			mapping : 'FIELDS'
		}, {
			name : 'p_RESULT_SEP',
			mapping : 'RESULT_SEP'
		}, {
			name : 'p_CONDITIONS',
			mapping : 'CONDITIONS'
		}, {
			name : 'p_IS_INCREMENT',
			mapping : 'IS_INCREMENT'
		}, {
			name : 'p_INCREMENTFIELD',
			mapping : 'INCREMENTFIELD'
		}, {
			name : 'p_STARTTIME',
			mapping : 'STARTTIME'
		},{
			name : 'p_TASKTYPE',
			mapping : 'TASKTYPE'
		});
		copyRecord = new editRecord( {
			p_IS_INCREMENT : record.get("IS_INCREMENT"),
			p_INCREMENTFIELD : record.get("INCREMENTFIELD"),
			p_STARTTIME : record.get("STARTTIME"),
			p_CONDITIONS : record.get("CONDITIONS"),
			p_RESULT_SEP:record.get("RESULT_SEP"),
			p_TABLE_NAME : record.get("TABLE_NAME"),
			p_FIELDS : record.get("FIELDS"),
			p_CONFIG_ID : record.get("CONFIG_ID"),
			p_TASK_NAME : record.get("TASK_NAME"),
			p_TASKTYPE : record.get("TASKTYPE")
				});
		
		addParamFormPanel.getForm().loadRecord(copyRecord);
		addParamWindow.show();
		addParamWindow.setTitle('<span class="commoncss">修改数据导出任务配置</span>');
		Ext.getCmp('windowmode').setValue('edit');
		Ext.getCmp('btnReset').hide();
	}

	/**
	 * 修改参数数据
	 */
	function updateParamItem() {
		if (!addParamFormPanel.form.isValid()) {
			return;
		}
		update();
		generateCondition();
	}

	/**
	 * 更新
	 */
	function update() {
		addParamFormPanel.form.submit({
			url : '../dataExport/update.shtml',
			waitTitle : '提示',
			method : 'POST',
			waitMsg : '正在处理数据,请稍候...',
			success : function(form, action) {
				addParamWindow.hide();
				store.reload();
				form.reset();
				remove_row();
			},
			failure : function(form, action) {
				var msg = action.result.msg;
				Ext.MessageBox.alert('提示', '数据修改失败:<br>' + msg);
			}
		});
	}
	
	
	/**
	 * 运行定时任务
	 */
	function runQuartzTask(){
		var type = typeCombo.getValue();
		var hour = Ext.getCmp('p_HOUR').getValue();
		if(hour != null && isTime(hour) && (type !=1 || type != 2)){
			Ext.MessageBox.alert('提示信息','<span style="color:red">对不起，您输入的日期格式不正确,正确的格式是(hh:mm),例如： 13:20.</span>');
			return ;
		}
		runTaskFormPanel.form.submit({
//			url : '../job/runTransTask.shtml',
			url : '../dataExport/runDataExportTask.shtml',
			waitTitle : '提示',
			method : 'POST',
			waitMsg : '正在处理数据,请稍候...',
			success : function(form, action) {
				Ext.MessageBox.alert('提示信息', action.result.msg);
				runTaskWindow.hide();
				store.reload();
				form.reset();
			},
			failure : function(form, action) {
				var msg = action.result.msg;
				Ext.MessageBox.alert('提示', '运行任务失败:<br>' + msg);
			}
		});
	}
	
	//对小时hour格式进行验证
	function isTime(str){      
	    if(str.length!=0){    
	    	reg=/^((20|21|22|23|[0-1]\d)\:[0-5][0-9])?$/     
	        if(!reg.test(str)){    
	           return true;   
	        }
	    	return false;
	    } 
	    return false
	}  
	
	
});