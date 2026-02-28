import React, { useEffect, useState } from 'react';
import { Button, InputNumber, Input, Popover } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import './style.less';
import {
    CloseOutlined,
  } from '@ant-design/icons';


  interface explain {
    id: number;
    timeout: number;
   
  }

const LoopExp: React.FC = () => {
    const { TextArea } = Input;
    const [tagList, setTagList] = useState<string[]>([]);

    const [exps,setExps]=useState<explain[]>([{id:1,timeout:5}])

    useEffect(() => {
        console.log("tagList: ", tagList);
    }, [tagList]);

    const inputFinish = (e: any) => {
        const { value: inputValue } = e.target;
        if (inputValue) {
            setTagList([...tagList, inputValue]);
            e.target.value = '';  // 清空输入框
        }
    };

    

    const closeTag = (index: number) => {
        const newList = tagList.filter((_, i) => i !== index);
        setTagList(newList);
    };

    function upTagValue(e:any,index:number){
        const { value: inputValue } = e.target;
        tagList[index]=inputValue
        setTagList([...tagList])

    }
    function addExpItem(){
        const newValue={id:exps.length+1,timeout:5}
        exps.push(newValue)
        setExps([...exps])
    }

    return (
        <div className='loop-main-div'>
            <div className='loop-speaks-body'>
                <div className='loop-speak'>
                    <span className='lp-speak-title'>循环话术</span>
                    <div className='hz-div'>
                        <InputNumber 
                            controls={false}
                            defaultValue={1} 
                            size='small'
                        />
                        <span className='hz-title'>秒/次</span>
                    </div> 
                </div>

                <div className='tags-div'>
                {tagList.map((item, index) => (
   
                    <Popover
                        content={
                            <TextArea
                                placeholder="请输入问题"
                                defaultValue={item}
                                onBlur={(e)=>{upTagValue(e,index)}}
                                // onPressEnter={(e)=>{upTagValue(e,index)}}
                                autoSize={{ minRows: 2, maxRows: 6 }}
                                />
                            }
                                trigger="click"
                                placement="bottom"
                              
                                >
                                    <div className='tag-item'>
                        
                                        <div className='tag-title'>{item}</div>
                                        <CloseOutlined className='close-icon'  onClick={()=>{closeTag(index)}}/>   
                                    </div>
                                    </Popover>

                    
                   
                ))}

                </div>

                <Input 
                    className='add-input'
                    onPressEnter={(e)=>{inputFinish(e)}}
                />

              

                <div className='loop-reaj'>
                    <div className='loop-title'>
                        <span className='lp-title-span'>循环讲解</span>
                        <span className='lp-title-span-desc'>设置间隔的时间，循环讲解</span>
                    </div>

                    <div className='lp-descs-body'>

                        <div className='lp-descs'>
                            {
                                exps.map((item,index)=>{
                                    return(
                                        <>
                                        <div className='exp-item'>
                                            <InputNumber className='shopId-num' defaultValue={item.id} controls={false}/>
                                            <span className='shop-span'>号</span>
                                            <InputNumber className='shop-timeout' defaultValue={item.timeout} controls={false}/>
                                            <span className='shop-span'>秒/次</span>

                                            <Button
                                                type="text"
                                                className='button-div'
                                                size="small"
                                                icon={<PlusOutlined />}
                                                onClick={() => {addExpItem()}}
                                            >
                                                删除
                                            </Button>
                                        </div>
                                           
                                        
                                        </>
                                    )
                                })
                            }

                        </div>


                        <div className='add-div'>

                            <Button
                                type="text"
                                className='button-div'
                                size="small"
                                icon={<PlusOutlined />}
                                onClick={() => {addExpItem()}}
                            >
                                新增
                            </Button>

                        </div>
                    </div>

                </div>
               
            </div>
        </div>
    );
};

export default LoopExp;
