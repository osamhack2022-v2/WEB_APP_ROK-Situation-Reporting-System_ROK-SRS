import { useState, useCallback } from "react";
import { Avatar, Button, List, Row, Col, Divider, Input } from "antd";
import { getCookie } from "cookies-next";
import koreanTimeFormat from "../helperfunction/koreanDateFormat";
import Styles from "../styles/MemoReport.module.css";

function ReportCard(props) {
  return (
    <div className={Styles.cardLayout}>
      <Row align="middle" justify="space-between">
        <Col>
          <Row gutter={12}>
            <Col>
              <Avatar src={props.pic} size={48} />
            </Col>
            <Col>
              <div className={Styles.cardName}>
                {/* for comment */}
                {props.type ? '[' + props.type + '] ' : ''}
                {props.name} {props.rank}
              </div>
              <div className={Styles.cardPosition}>{props.position}</div>
            </Col>
          </Row>
        </Col>
        <Col className={Styles.cardDatetime}>
          {koreanTimeFormat(props.datetime)}
        </Col>
      </Row>
      <div className={Styles.cardMemo}>{props.memo}</div>
    </div>
  );
}

// component for report comment
function ReportList(props) {
  return (
    <List
      itemLayout="vertical"
      dataSource={props.data.filter((data) => (data))}
      renderItem={(item, index) => (
        <List.Item key={index}>
          <ReportCard
            pic={item.User?.pic}
            name={item.User?.Name}
            rank={item.User?.Rank}
            position={item.User?.Position}
            type={item.Type}
            memo={item.Content}
            datetime={item.createdAt}
          />
        </List.Item>
      )}
    />
  );
}

function ReportLayout(props) {
  const [commentContent, setCommentContent] = useState("");
  const [commentType, setCommentType] = useState(0);

  const commentTypes = ['보고', '지시', '긴급'];
  const commentTypeStyle = useCallback(
    (type) => {
      switch (type) {
        case 0:
          return ({ backgroundColor: '#16a34a' });
        case 1:
          return ({ backgroundColor: '#fb923c' });
        case 2:
          return ({ backgroundColor: '#dc2626' });
      }
    },
    []
  );

  const submitComment = useCallback(
    (type, content) => {
      const submitData = {
        ReportId: props.id,
        Type: type,
        Content: content,
      };

      fetch(process.env.NEXT_PUBLIC_BACKEND_ROOT + "api/comment/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${getCookie("usercookie")}`,
        },
        body: JSON.stringify(submitData),
      }).then((res) => {
        if (res.status === 200 || res.status === 201) {
          setCommentContent("");
        }
      });
      props.onRefresh();
    },
    [props.id, props.onRefresh]
  );

  function ButtonGroup() {
    return (
      <div>
        <Button type="primary" size="large" danger>
          종결하기
        </Button>
        <Button size="large">상급보고</Button>
      </div>
    );
  }

  return (
    <div className={Styles.reportLayout}>
      <Row>
        <Col className={Styles.memoHeader}>{props.header}</Col>
      </Row>
      <Divider className={Styles.memoDivider} />
      <Row className={Styles.contentLayout}>
        <Col className={Styles.cardListLayout}>
          <ReportCard
            pic={props.pic}
            name={props.name}
            rank={props.rank}
            position={props.position}
            memo={props.memo}
            datetime={props.datetime}
          />
          {props.comment && (
            <div className={Styles.memoComment}>
              <ReportList data={props.comment} />
            </div>
          )}
        </Col>
      </Row>
      <div className={Styles.memoFooterGroup}>
        <Input.Group compact>
          <Button
            type="primary"
            style={commentTypeStyle(commentType)}
            onClick={() => setCommentType(index => (index + 1) % 3)}
          >
            {commentTypes[commentType]}
          </Button>
          <Input
            style={{ width: "calc(100% - 120px)", border: "1px solid #aaa" }}
            value={commentContent}
            onChange={(event) => setCommentContent(event.target.value)}
          />
          <Button type="primary" onClick={() => submitComment(commentTypes[commentType] + '사항', commentContent)}>
            전송
          </Button>
        </Input.Group>
        <Divider className={Styles.memoDivider} />
        <Row className={Styles.memoFooter} justify="space-between">
          <Col>{props.footer}</Col>
          <Col>
            <ButtonGroup />
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default ReportLayout;
export { ReportCard, ReportList };
