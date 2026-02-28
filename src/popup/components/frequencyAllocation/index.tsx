import React, { useImperativeHandle, useState,forwardRef, useEffect } from 'react';
import { Input} from 'antd';
import type { InputRef } from 'antd';
import './style.less';

interface VerbalTrickItem {
  seconds: number,
  content: string,
}
interface CommItem {
  seconds: number,
  shop:number
}

interface ChildProps {
    getPinlv: (keyword: any) => void;
}
interface FrequencyAllocationProps {
  questions?: VerbalTrickItem[]; // 父组件传递的话术列表
  pushQuan?: CommItem[]; // 父组件传递的讲解列表
  speakNum?: CommItem[]; // 父组件传递的弹品列表
  pushProduct?: CommItem[]; // 父组件传递的弹券列表

}


const FrequencyAllocation =  forwardRef ((props:FrequencyAllocationProps,ref)=> {
  const {
    questions = [{
      seconds: 60,
      content: '',
    },],
    pushQuan = [ {
      seconds: 60,
      shop:1
    }],
    speakNum = [ {
      seconds: 60,
      shop:1
    }],
    pushProduct = [ {
      seconds: 60,
      shop:1
    }],
  
  } = props;

 
  useEffect(() => {
    (async () => {
     console.log("porps父组件",props)
    })();

  
  }, []);




  const [verbalTrickList, setVerbalTrickList] = useState<VerbalTrickItem[]>(questions);
  const [explainList, setExplainList] = useState<CommItem[]>(speakNum);
  const [productList, setProductList] = useState<CommItem[]>(pushProduct);
  const [vouchersList, setVouchersList] = useState<CommItem[]>(pushQuan);
  const [forTimeOut,setForTimeOut]=useState<number>(questions[0].seconds)

   // 通过 useImperativeHandle 暴露方法,向父组件传值
   useImperativeHandle(ref, () => ({
    getValue: () => {return({verbalTrickList:verbalTrickList,explainList:explainList,productList:productList,vouchersList:vouchersList})},
}));


  const addVerbal = () => {
    setVerbalTrickList([...verbalTrickList, {
      seconds: 60,
      content: '',
    }]);
  }
  const verbalDelete = (index: number) => {
    const newList = [...verbalTrickList];
    newList.splice(index, 1);
    setVerbalTrickList(newList);
  }

  const explainDelete = (index: number) => {
    const newList = [...explainList];
    newList.splice(index, 1);
    setExplainList(newList);
  }

  const addExplain = () => {
    setExplainList([...explainList, {
      seconds: 60,
      shop:explainList.length+1
    }]);
  }

  const productAdd = () => {
    setProductList([...productList, {
      seconds: 60,
      shop:explainList.length+1
    }]);
  }

  const productDelete = (index: number) => {
    const newList = [...productList];
    newList.splice(index, 1);
    setProductList(newList);
  }

  
  const vouchersAdd = () => {
    setVouchersList([...vouchersList, {
      seconds: 60,
      shop:explainList.length+1
    }]);
  }

  const vouchersDelete = (index: number) => {
    const newList = [...vouchersList];
    newList.splice(index, 1);
    setVouchersList(newList);
  }

  //循环话术-时间
  const handleVerbalSecondsBlur = (e: React.ChangeEvent<HTMLInputElement>,index: number) => {
    // const newList = [...verbalTrickList];
    // newList[index].seconds = parseInt(e.target.value, 10);
    // setVerbalTrickList(newList);
    setForTimeOut(parseInt(e.target.value, 10))
    verbalTrickList[index].seconds = parseInt(e.target.value, 10);
    setVerbalTrickList([...verbalTrickList]);
  }

  //循环话术-话术
  const handleVerbalBlur = (e: React.ChangeEvent<HTMLInputElement>,index: number) => {
    const newList = [...verbalTrickList];
    newList[index].content = e.target.value;
    setVerbalTrickList(newList);
    let data = {
      key: "hs",
      value: newList,
    }
    
  }

  //循环讲解-商品
  const handleExplainShopBlur=(e: React.ChangeEvent<HTMLInputElement>,index: number)=>{
    const newList = [...explainList];
    console.log("选嗷：",e.target.value)
    newList[index].shop = e.target.value.trim() === '' ? 0 : parseInt(e.target.value, 10);
    setExplainList(newList);
    let data = {
      key: "jj",
      value: newList,
    }
  }

  //循环讲解-时间
  const handleExplainSecondsBlur = (e: React.ChangeEvent<HTMLInputElement>,index: number) => {
    const newList = [...explainList];
    newList[index].seconds = e.target.value.trim() === '' ? 0 : parseInt(e.target.value, 10);
    setExplainList(newList);
    let data = {
      key: "jj",
      value: newList,
    }
   
  }
  //循环弹品-商品
  const handleProductShopBlur = (e: React.ChangeEvent<HTMLInputElement>,index: number) => {
    const newList = [...productList];
    newList[index].shop = e.target.value.trim() === '' ? 0 : parseInt(e.target.value, 10);
    setProductList(newList);
    let data = {
      key: "tp",
      value: newList,
    }
   
  }


  //循环弹品-时间
  const handleProductSecondsBlur = (e: React.ChangeEvent<HTMLInputElement>,index: number) => {
    const newList = [...productList];
    newList[index].seconds = e.target.value.trim() === '' ? 0 : parseInt(e.target.value, 10);
    setProductList(newList);
    let data = {
      key: "tp",
      value: newList,
    }
   
  }
  //循环弹卷-商品
  const handleVouchersShopBlur = (e: React.ChangeEvent<HTMLInputElement>,index: number) => {
    const newList = [...vouchersList];
    newList[index].shop = e.target.value.trim() === '' ? 0 : parseInt(e.target.value, 10);
    setVouchersList(newList);
    let data = {
      key: "tj",
      value: newList,
    }
    
  }


  //循环弹卷-时间
  const handleVouchersSecondsBlur = (e: React.ChangeEvent<HTMLInputElement>,index: number) => {
    const newList = [...vouchersList];
    newList[index].seconds = e.target.value.trim() === '' ? 0 : parseInt(e.target.value, 10);
    setVouchersList(newList);
    let data = {
      key: "tj",
      value: newList,
    }
    
  }



  return (
    <div className='frequency-allocation comm-pb'>
      <div className='verbal-trick'>
        {verbalTrickList.length>0?'':<p className='title'>循环话术</p>}
        <ul>
          {
            verbalTrickList.map((item, index) => {
              return (
                <li>
                  <div className='top'>
                    <span className='title'>循环话术{index+1}</span>
                    <div className='seconds'>
                      <Input className='seconds-input'
                        placeholder='0'
                        key={index}
                        type='number'
                        value={forTimeOut}
                        onChange={(e) => handleVerbalSecondsBlur(e,index)}
                        onBlur={(e) => handleVerbalSecondsBlur(e,index)}
                      />
                      <span>秒/次</span>
                    </div>
                    <div className='btn' onClick={()=>verbalDelete(index)}>-删除</div>
                  </div>
                  <div className='bottom'>
                    <Input
                      className='cont-input'
                      key={index}
                      placeholder='请输入固定的话术'
                      value={item.content}
                      onChange={(e) => handleVerbalBlur(e,index)}
                      onBlur={(e) => handleVerbalBlur(e,index)}
                    />
                  </div>
                </li>
              )
            })
          }
        </ul>
        <div className='btn' onClick={()=>addVerbal()}>+新增</div>
      </div>
      <div className='comm-box'>
        <p className='title'>循环讲解</p>
        <p className='tips'>设置间隔的时间，循环讲解</p>
        <ul>
          {
            explainList.map((item, index) => {
              return (
                <li>
                  <div className='left'>
                    <Input className='number-txt'
                      placeholder='0'
                  
                      defaultValue="1" 
                      value={item.shop}
                      onChange={(e) => handleExplainShopBlur(e,index)}
                      onBlur={(e) => handleExplainShopBlur(e,index)}
                    />
                    <span>号商品</span>&nbsp;&nbsp;&nbsp;&nbsp;
                    <Input className='number-txt seconds-txt'
                      placeholder='0'
                      defaultValue="60" 
                      value={item.seconds}
                      onChange={(e) => handleExplainSecondsBlur(e,index)}
                      onBlur={(e) => handleExplainSecondsBlur(e,index)}
                    />
                    <span>秒</span>
                  </div>
                  {/* <div className='right'>
                    <div className='btn' onClick={()=>explainDelete(index)}>-删除</div>
                  </div> */}
                </li>
              )
            })
          }
        </ul>
        {/* <div className='btn' onClick={()=>addExplain()}>+新增</div> */}
      </div>
      <div className='comm-box'>
        <p className='title'>循环弹品</p>
        <p className='tips'>循环弹出商品链接，设置间隔的时间，循环弹品</p>
        <ul>
          {
            productList.map((item, index) => {
              return (
                <li>
                  <div className='left'>
                    <Input className='number-txt'
                      placeholder='0'
                  
                      defaultValue="1" 
                      value={item.shop}
                      onChange={(e) => handleProductShopBlur(e,index)}
                      onBlur={(e) => handleProductShopBlur(e,index)}
                    />
                    <span>号商品</span>&nbsp;&nbsp;&nbsp;&nbsp;
                    <Input className='number-txt seconds-txt'
                      placeholder='0'
                      defaultValue="60" 
                      value={item.seconds}
                      onChange={(e) => handleProductSecondsBlur(e,index)}
                      onBlur={(e) => handleProductSecondsBlur(e,index)}
                    />
                    <span>秒</span>
                  </div>
                  {/* <div className='right'>
                    <div className='btn' onClick={()=>productDelete(index)}>-删除</div>
                  </div> */}
                </li>
              )
            })
          }
        </ul>
        {/* <div className='btn' onClick={()=>productAdd()}>+新增</div> */}
      </div>
      <div className='comm-box'>
        <p className='title'>循环弹券</p>
        <p className='tips'>循环弹出优惠券，设置间隔的时间，循环弹券</p>
        <ul>
          {
            vouchersList.map((item, index) => {
              return (
                <li>
                  <div className='left'>
                    <Input className='number-txt'
                      placeholder='0'
                      
                      defaultValue="1" 
                      value={item.shop}
                      onChange={(e) => handleVouchersShopBlur(e,index)}
                      onBlur={(e) => handleVouchersShopBlur(e,index)}
                    />
                    <span>号商品</span>&nbsp;&nbsp;&nbsp;&nbsp;
                    <Input className='number-txt seconds-txt'
                      placeholder='0'
                      defaultValue="60" 
                      value={item.seconds}
                      onChange={(e) => handleVouchersSecondsBlur(e,index)}
                      onBlur={(e) => handleVouchersSecondsBlur(e,index)}
                    />
                    <span>秒</span>
                  </div>
                  {/* <div className='right'>
                    <div className='btn' onClick={()=>vouchersDelete(index)}>-删除</div>
                  </div> */}
                </li>
              )
            })
          }
        </ul>
        {/* <div className='btn' onClick={()=>vouchersAdd()}>+新增</div> */}
      </div>
    </div>
  );
});

export default FrequencyAllocation;
