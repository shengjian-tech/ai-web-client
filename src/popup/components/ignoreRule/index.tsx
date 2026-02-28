import React, { useEffect, useState,useRef ,useImperativeHandle,forwardRef} from 'react';
import { Checkbox, Input} from 'antd';
import type { InputRef } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';
import './style.less';

interface Item {
  checked:boolean,
  title: string,
  tips: string,
  tags: string[]

}
interface IgnoreProps{
  ignoreNick:any[],
  ignoreWord:any[]
}

const IgnoreRule = forwardRef((props:IgnoreProps,ref) => {
const {ignoreNick=[],ignoreWord=[]}=props




  const [list, setList] = useState<Item[]>([
    {
    checked:ignoreNick.length>0? true: false,
    title: "忽略本人&指定昵称",
    tips: '取消勾选后将关闭忽略规则，默认不开启',
    tags:ignoreNick
  },
  {
    checked:ignoreWord.length>0? true:false,
    title: "忽略评论内容的关键词",
    tips: '取消勾选后将关闭忽略规则，默认不开启',
    tags:ignoreWord
  },
  ]);
  const [tags, setTags] = useState<string[]>([]);
  const [inputVisible, setInputVisible] = useState(false);
  const [currentListIndex, setCurrentListIndex] = useState<number | null>(null);
  const [editInputValue, setEditInputValue] = useState('');
  const inputRef = useRef<InputRef>(null);
  const editInputRef = useRef<InputRef>(null);


    // 通过 useImperativeHandle 暴露方法
    useImperativeHandle(ref, () => ({
      getValue: () => {return({igNick:list[0].tags,igKeyWord:list[1].tags})},
  }));

  useEffect(() => {
    if (inputVisible) {
      inputRef.current?.focus();
    }
  }, [inputVisible]);

  useEffect(() => {
    editInputRef.current?.focus();
  }, [editInputValue]);

  const tagInputStyle: React.CSSProperties = {
    width: 64,
    height: 22,
    marginBottom: 10,
    marginRight: 10,
  };

  const onChange = (e: any, index: number) => {
    const newList = [...list];
    newList[index].checked = e.target.checked;
    setList(newList);
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditInputValue(e.target.value);
  };

  const handleEditInputConfirm = () => {
    console.log("editInputValue:---",editInputValue)
    if (!editInputValue) {
      return setCurrentListIndex(-1);
    }
    if (currentListIndex !== null) {
      const newList = [...list];
      newList[currentListIndex].tags = [...newList[currentListIndex].tags, editInputValue];
      setList(newList);
      setEditInputValue('');
      setCurrentListIndex(-1);
    }
  };

  const addTag = (index: number) => {
    setCurrentListIndex(index); // 记录正在编辑的列表项
  };

  const deleteTag = (listIndex: number, tagIndex: number) => () => {
    const newList = [...list];
    newList[listIndex].tags.splice(tagIndex, 1); // 删除指定的 tag
    setList(newList);
  };

  // //子组件向父组件传值
  // function putForParent(va:any){
  //   ignoreDatas(va)
  // }

  return (
    <div className='ignore-rule comm-pb'>
      <ul>
        { list.map<React.ReactNode>((item, index) => {
          return (
            <li key={index}>
              <div className='check-box'>
                <Checkbox checked={item.checked} onChange={(e) => onChange(e, index)}>
                  {item.title}
                </Checkbox>
              </div>
              <p className='tips'>{item.tips}</p>
              <div className='tags-box'>
                {item.tags.map((tag, index2) => { 
                  return (
                    <div className='tag'>
                      <CloseCircleOutlined className='close' onClick={deleteTag(index,index2)} />
                      {tag}
                    </div>
                  )
                })}
                {currentListIndex === index && (
                  <Input
                    ref={editInputRef}
                    key={index}
                    size="small"
                    style={tagInputStyle}
                    value={editInputValue}
                    onChange={handleEditInputChange}
                    onBlur={handleEditInputConfirm}
                    onPressEnter={handleEditInputConfirm}
                  />
                )}
                {currentListIndex !==index && (<div className='tag' onClick={() => addTag(index)}>+新增</div>)}
              </div>
            </li>
            );
          }
        )}
      </ul>
    </div>
  );
});

export default IgnoreRule;
