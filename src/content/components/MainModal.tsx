import React, { useState } from 'react';
import { Button, Input, Modal } from 'antd';
import './style.less'

interface MainModalProps {
    onClose: () => void;
}

const MainModal: React.FC<MainModalProps> = ({ onClose }) => {
    const [text, setText] = useState<string | null>(null);

    // 随着Input的输入变化，及时更新text
    const handleIptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setText(e.target.value);
    };

   

    return (
        <Modal
            className="CRX-mainModal"
            open={true}
            title="CRX对话框"
            footer={null}
            maskClosable={false}
            onCancel={onClose}
            width={600}
        >
            <div className="main-content-con">
                <div className="item-con">
                    <Input
                        placeholder="请输入内容"
                       
                        onChange={handleIptChange}
                    />
                </div>
                <div>
                    <Button type="primary" block onClick={()=>{}}>
                        Submit
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default MainModal;