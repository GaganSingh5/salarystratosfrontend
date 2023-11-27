import { useState } from "react";
import {Container, Form, Row, Col, Button, Card, Badge, Stack, Accordion } from "react-bootstrap";

function SearchPage() {

  const [searchInput, setSearchInput] = useState("");
  const [jobList, setJobList] = useState([1,2,3,4, 5, 6]);
  const [suggestedWords, setSuggestedWords] = useState([]);


  const searchForJobs = () => {
    fetch("http://localhost:8080/wordSuggestions").then(async (data) => {
      const result = await data.json();
      console.log(result);
    });
  }
  

  return (
    <Container className="vw-100 vh-100 p-4 justify-center">
      <Row className="vw-90 mb-3" xs="auto">
        <Col lg={5} className="vw-60 px-0">
          <Form>
            <Form.Group className="w-100" controlId="jobSearch">
              <Form.Control
                size="lg"
                type="text"
                placeholder="Enter keywords to search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Col>
        <Col className="pl-2 align-middle d-flex">
          <Button onClick={() => searchForJobs()} variant="primary">
            Search
          </Button>
        </Col>
        <Col className="d-flex align-items-center">
          <Form className="d-flex">
            {["SimplyHired", "RemoteOk", "GlassDoor"].map((type) => (
              <div key={`job-${type}`}>
                <Form.Check // prettier-ignore
                  type="checkbox"
                  id={`job-${type}`}
                  label={`${type}`}
                  className="mx-2"
                />
              </div>
            ))}
          </Form>
        </Col>
        <Col className="d-flex pl-2 align-middle">
          <Button onClick={() => null} variant="primary">
            Crawl
          </Button>
        </Col>
      </Row>
      <Row>
        <Card>
          <Card.Body>
            <Card.Title>Suggestions</Card.Title>
            <Card.Text>
              <Stack direction="horizontal" gap={2}>
                <Badge bg="primary">Primary</Badge>
                <Badge bg="secondary">Secondary</Badge>
              </Stack>
            </Card.Text>
          </Card.Body>
        </Card>
      </Row>
      <Row
        style={{
          height: "70vh",
          overflowY: "scroll",
          padding: "2rem",
          marginTop: "2rem",
          border: "1px solid lightgray",
          borderRadius: "0.5rem",
        }}
      >
        {jobList.length > 0 ? (
          jobList.map(() => {
            return (
              <Card style={{ minHeight: "100px", marginBottom: "2rem" }}>
                <Card.Body>
                  <Card.Title>Title</Card.Title>
                  <Row>
                    <Col>Location</Col>
                    <Col style={{ textAlign: "end" }}>Salary</Col>
                  </Row>
                  <Card.Text></Card.Text>
                  <Accordion>
                    <Accordion.Item eventKey="0">
                      <Accordion.Header>Description</Accordion.Header>
                      <Accordion.Body>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit,
                        sed do eiusmod tempor incididunt ut labore et dolore
                        magna aliqua. Ut enim ad minim veniam, quis nostrud
                        exercitation ullamco laboris nisi ut aliquip ex ea
                        commodo consequat. Duis aute irure dolor in
                        reprehenderit in voluptate velit esse cillum dolore eu
                        fugiat nulla pariatur. Excepteur sint occaecat cupidatat
                        non proident, sunt in culpa qui officia deserunt mollit
                        anim id est laborum.
                      </Accordion.Body>
                    </Accordion.Item>
                  </Accordion>
                </Card.Body>
              </Card>
            );
          })
        ) : (
          <h3 className="text-center">No Jobs to show</h3>
        )}
      </Row>
    </Container>
  );
}

export default SearchPage;
