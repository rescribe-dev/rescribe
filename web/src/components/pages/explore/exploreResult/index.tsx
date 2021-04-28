import React from 'react';
import { Row, Button, Col, Card, CardBody } from 'reactstrap';
import CodeHighlight from 'components/codeHighlight';
import './index.scss';

/*
For a repoUrl, the format will be below:
author/repoName/pathfile/filename
*/
export interface ExploreResultType {
  repoUrl: string;
  repoCode: string;
  repoName: string;
  repoLang: string;
  repoDes: string;
  selected: boolean;
}

const ExploreResultComponent = (args: ExploreResultType): JSX.Element => {
  const parts = args.repoUrl.split('/');
  return (
    <Card
      className="rounded-0"
      style={{
        backgroundColor: '#FDF4E7',
        marginTop: '31px',
        marginBottom: '23px',
      }}
    >
      <CardBody>
        <Row>
          <Col
            className="dot"
            style={{
              flexGrow: 0,
              height: '25px',
              background: '#C4C4C4',
              borderRadius: '50%',
              padding: '12.5px',
              margin: '12px',
            }}
          ></Col>
          <Col>
            <Row>
              <a
                style={{
                  color: '#0275D8',
                  fontFamily: 'Noto Sans, sans-serif',
                }}
                href={args.repoUrl}
              >
                {parts[parts.length - 1]}
              </a>
            </Row>
            <Row style={{ padding: '0px' }}>
              <p
                style={{
                  marginRight: '3px',
                  fontWeight: 600,
                  fontFamily: 'Noto Sans, sans-serif',
                }}
              >
                {parts[0] + '/' + parts[1] + ' '}
              </p>
              <a
                style={{
                  color: '#0275D8',
                  fontFamily: 'Noto Sans, sans-serif',
                }}
                href={args.repoUrl}
              >
                {'> ' + parts[parts.length - 1]}
              </a>
            </Row>
          </Col>
          <Col
            className="dot"
            style={{
              flexGrow: 0,
              height: '12px',
              width: '12px',
              background: '#F0AD4E',
              borderRadius: '50%',
              padding: '6px',
              textAlign: 'right',
              marginTop: '19px',
              marginLeft: '6em',
              marginRight: '10px',
            }}
          ></Col>
          <Col
            className="d-flex align-items-center"
            sm="2"
            style={{
              textAlign: 'right',
              padding: '0%',
            }}
          >
            <p style={{ fontFamily: 'Noto Sans, sans-serif' }}>
              {args.repoLang}
            </p>
          </Col>
        </Row>
        <Row
          style={{
            background: '#F7F7F7',
            border: '1px solid #ddd',
            borderLeft: '3px solid #5CB85C',
            padding: '15px',
            margin: '10px',
            marginTop: '-10px',
          }}
        >
          <Col>
            <CodeHighlight
              startIndex={0}
              code={args.repoCode.split('\n')}
              language={'typescript'}
            />
          </Col>
        </Row>
        <Row>
          <Col sm="6" className="d-flex align-items-center">
            <a
              style={{
                color: '#0275D8',
              }}
              href={args.repoUrl}
            >
              See all 20 results
            </a>
          </Col>
          <Col sm="6" className="d-flex flex-row-reverse align-items-center">
            <Button
              style={{
                backgroundColor: 'transparent',
                borderColor: 'transparent',
              }}
            >
              {/* download icon */}
            </Button>
            <Button
              className="rounded-0"
              style={{
                width: '140px',
                height: '27px',
                background: '#DADADA',
                fontSize: '14px',
                fontFamily: 'NotoSans, sans-serif',
                color: 'black',
                borderWidth: '0px',
              }}
            >
              Copy {args.repoCode.split('\n').length} lines
            </Button>
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
};

export default ExploreResultComponent;
