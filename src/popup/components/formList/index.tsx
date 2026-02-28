import React, { useEffect, useState } from "react";
import { Button, theme, ThemeConfig, Space, Dropdown, message, Select, Form, Input, Popover, Checkbox } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";

import "./style.less";

interface ChildProps {
    isSave: boolean;
    getQaKeyWords: (keyword: any) => void;
    feedbackKeywordData:{question:string,anwer:string}[];
}

const FormList: React.FC<ChildProps> = ({ getQaKeyWords, isSave, feedbackKeywordData=[] }) => {
    //关键词回复
    const { TextArea } = Input;
    const [form] = Form.useForm(); // 初始化 form 实例

    useEffect(() => {
        if (feedbackKeywordData && feedbackKeywordData.length > 0) {
            form.setFieldsValue({
                keyword_list: feedbackKeywordData,
            });
        }
    }, [feedbackKeywordData, form]);

    const onFinish = (values: any) => {
        console.log("Received values of form:", values);
        let qaKeywords: any[] = [];
        // 在这里可以处理每行的数据
        values.keyword_list.forEach((item: any, index: number) => {
            console.log(`Row ${index + 1}: Question: ${item.question}, Answer: ${item.answer}`);
            const data={question:item.question,answer:item.answer}
            // const str = `Row ${index + 1}: Question: ${item.question}, Answer: ${item.answer}`;
            qaKeywords.push(data);
        });
        // 将关键词回复发送给父组件
        getQaKeyWords(qaKeywords);
    };

    // 初始化时添加一个默认的字段
    React.useEffect(() => {
        if (!form.getFieldsValue().keyword_list || form.getFieldsValue().keyword_list.length === 0) {
            form.setFieldsValue({
                keyword_list: [{ question: "", answer: "", questionVisible: false, answerVisible: false }],
            });
        }
    }, [form]);

    // const saveKeyWords = () => {
    //     const all = form.getFieldsValue();
    //     console.log("all:---", all);

    //     // 将关键词回复发送给父组件
    //     const kl = all.keyword_list;
    //     if (kl?.length > 0) {
    //         let qaKeywords: string[] = [];
    //         kl.forEach((element: any, index: number) => {
    //             const str = `Row ${index + 1}: Question: ${element.question}, Answer: ${element.answer}`;
    //             qaKeywords.push(str);
    //         });
    //         console.log("-1-1-1--",qaKeywords)
    //         getQaKeyWords(qaKeywords);
    //     }
    // };

    return (
        <div className="keyword-from-div">
            <Form form={form} name="keyword_form" onFinish={onFinish} style={{ maxWidth: 600 }} autoComplete="off">
                <Form.List name="keyword_list" initialValue={[{ question: "", answer: "", questionVisible: false, answerVisible: false }]}>
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, fieldKey, ...restField }, index) => (
                                <Space key={key} style={{ display: "flex", marginBottom: 5 }} align="baseline">
                                    <span className="custom-label">问：</span>
                                    <Form.Item {...restField} name={[name, "question"]}>
                                        <Popover
                                            content={
                                                <Form.Item
                                                    name={[name, "question"]} // 确保与 Form 的字段绑定
                                                    initialValue={form.getFieldValue([name, "question"])} // 确保初始值
                                                >
                                                    <TextArea
                                                        placeholder="请输入问题"
                                                        value={form.getFieldValue([name, "question"])} // 绑定字段值
                                                        onChange={(e) => form.setFieldsValue({ [`${name}.question`]: e.target.value })} // 更新字段值
                                                    />
                                                </Form.Item>
                                            }
                                            trigger="click"
                                            placement="bottom"
                                            visible={form.getFieldValue([name, "questionVisible"])}
                                            onVisibleChange={(visible) => {
                                                if (!visible) {
                                                    document.getElementById("save-but-keywrods")?.click();
                                                }
                                                form.setFieldsValue({ [`${name}.questionVisible`]: visible });
                                            }}
                                        >
                                            <Button type="text" className="buttonText-div" size="small">
                                                请输入问题
                                            </Button>
                                        </Popover>
                                    </Form.Item>

                                    <span className="custom-label">答：</span>

                                    <Form.Item {...restField} name={[name, "answer"]}>
                                        <Popover
                                            content={
                                                <Form.Item
                                                    name={[name, "answer"]} // 确保与 Form 的字段绑定
                                                    initialValue={form.getFieldValue([name, "answer"])} // 确保初始值
                                                >
                                                    <TextArea
                                                        placeholder="请输入答案"
                                                        value={form.getFieldValue([name, "answer"])} // 绑定字段值
                                                        onChange={(e) => form.setFieldsValue({ [`${name}.answer`]: e.target.value })} // 更新字段值
                                                    />
                                                </Form.Item>
                                            }
                                            trigger="click"
                                            placement="bottom"
                                            visible={form.getFieldValue([name, "answerVisible"])}
                                            onVisibleChange={(visible) => {
                                                if (!visible) {
                                                    document.getElementById("save-but-keywrods")?.click();
                                                }

                                                form.setFieldsValue({ [`${name}.answerVisible`]: visible });
                                            }}
                                        >
                                            <Button type="text" className="buttonText-div" size="small">
                                                请输入答案
                                            </Button>
                                        </Popover>
                                    </Form.Item>

                                    {index > 0 && <MinusCircleOutlined className="remove-svg" style={{ color: "#707271", fontSize: "20px" }} onClick={() => remove(name)} />}
                                </Space>
                            ))}

                            <Form.Item>
                                <Button type="text" className="button-div" size="small" onClick={() => add()} icon={<PlusOutlined />}>
                                    新增
                                </Button>

                                <Button id="save-but-keywrods" type="primary" htmlType="submit" style={{ display: "none" }}>
                                    提交
                                </Button>
                            </Form.Item>
                        </>
                    )}
                </Form.List>
            </Form>
        </div>
    );
};
export default FormList;
