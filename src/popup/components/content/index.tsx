import React, { useState, useEffect } from 'react'
import { Button, theme, ThemeConfig, Space, Dropdown, message, Select, Form, Input, Popover, Checkbox } from 'antd'


import './style.less';

interface ChildProps {
    getEmojiAndReply: (keyword: any) => void;
    feedbackEmoji: boolean,
    feedbackReply: string,
}

const Content: React.FC<ChildProps> = ({ getEmojiAndReply, feedbackEmoji=false, feedbackReply='' }) => {
    const [emojiChecked, setEmojiChecked] = useState(feedbackEmoji);
    const [replyChecked, setReplyChecked] = useState(feedbackReply != null && feedbackReply != '' ? true : false);
    const [fallbackReply, setFallbackReply] = useState(feedbackReply);

    useEffect(() => {
        // 在状态变化时调用 getEmojiAndReply 方法并打印最新的状态值
        console.log("+++:", emojiChecked, "---", replyChecked, "***", fallbackReply);
        const values = [emojiChecked, replyChecked, fallbackReply];
        getEmojiAndReply(values);
    }, [emojiChecked, replyChecked, fallbackReply]);


    useEffect(() => {
        if (feedbackEmoji != null && feedbackEmoji != undefined) {
            setEmojiChecked(feedbackEmoji)
        }
        if (feedbackReply && feedbackReply != '') { 
            setReplyChecked(true)
            setFallbackReply(feedbackReply)
        }
    }, [feedbackEmoji, feedbackReply]);
    
    const handleEmojiChange = (e: any) => {
        const checked = e.target.checked;
        setEmojiChecked(checked);
    };

    const handleReplyChange = (e: any) => {
        const checked = e.target.checked;
        setReplyChecked(checked);
    };

    const handleFallbackReplyChange = (e: any) => {
        const value = e.target.value;
        setFallbackReply(value);
    };

    return (
        <>
            <div className='emoji-div'>
                <div className='content-title'>
                    <Checkbox checked={emojiChecked} onChange={handleEmojiChange}>随机表情😊</Checkbox>
                </div>
                <div className='text-div'>开启后随机在一段话术中补充两个表情包！</div>
            </div>

            <div className='finally-div'>
                <div className='content-title'>
                    <Checkbox checked={replyChecked} onChange={handleReplyChange}>兜底回复</Checkbox>
                </div>
                <div className='text-div'>未能匹配到关键词时将使用兜底回复</div>
                <div className='input-div'>
                    <Input 
                        placeholder='请在这里输入兜底回复' 
                        size='small' 
                        value={fallbackReply} 
                        onChange={handleFallbackReplyChange} 
                    />
                </div>
            </div>
        </>
    );
}
export default Content