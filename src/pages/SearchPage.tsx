import { useCallback, useEffect, useState, useMemo } from "react";
import {
  Container,
  Form,
  Row,
  Col,
  Button,
  Card,
  Badge,
  Stack,
  Accordion,
  ListGroup,
} from "react-bootstrap";

function SearchPage() {
  const [searchInput, setSearchInput] = useState("");
  const [jobList, setJobList] = useState([1, 2, 3, 4, 5, 6]);
  const [suggestedWords, setSuggestedWords] = useState([]);
  const [recentSearch, setRecentSearch] = useState({});
  const [correctWords, setCorrectWords] = useState([]);

  const onSearch = () => {
    fetch("http://localhost:8080/api/correctWords", {
      method: "POST",
      headers: new Headers({
        "Content-Type": "application/x-www-form-urlencoded", // <-- Specifying the Content-Type
      }),
      body: `searchTerm=${searchInput}&suggestionCount=${5}`,
    }).then(async (data) => {
      const response = await data.json();
      console.log(response);
      setCorrectWords(response);
    });
  };

  useEffect(() => {
    fetch("http://localhost:8080/api/recentSearches", {
      method: "Get",
    }).then(async (data) => {
      const response = await data.json();
      console.log(typeof response);
      console.log(Object.keys(response));
      setRecentSearch(response);
    });
  }, []);

  useEffect(() => {
    console.log("executed");
    const timeoutFunction = setTimeout(() => {
      fetch("http://localhost:8080/api/wordSuggestions", {
        method: "POST",
        headers: new Headers({
          "Content-Type": "application/x-www-form-urlencoded", // <-- Specifying the Content-Type
        }),
        body: `searchTerm=${searchInput}&suggestionCount=${5}`,
      }).then(async (data) => {
        const response = await data.json();
        console.log(response);

        let object = {};
        const arr = [];
        // if ()
        setSuggestedWords(
          response.wordSuggestions.map((data) => {
            object = {
              word: data.word,
              suggestions: data.suggestedWords,
            };
            arr.push(object);
          })
        );

        console.log(arr);

        setSuggestedWords(arr);
      });
    }, 1000);

    return () => clearTimeout(timeoutFunction);
  }, [searchInput]);

  const searchForJobs = () => {
    fetch("http://localhost:8080/api/wordSuggestions", {
      method: "POST",
      body: searchInput,
    }).then(async (data) => {
      const result = await data.json();
      console.log(result);
    });
  };

  return (
    <Container className="vw-100 p-4 justify-center">
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
          <Button onClick={() => onSearch()} variant="primary">
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
      <Row className="mb-2">
        <Col lg={5} className="p-0">
          <Card>
            <Card.Body>
              <Card.Title>Recent Searches With Frequency Count</Card.Title>
              <Card.Text>
                <Stack
                  style={{ flexWrap: "wrap" }}
                  direction="horizontal"
                  gap={2}
                >
                  {recentSearch &&
                    Object.keys(recentSearch) &&
                    Object.keys(recentSearch)?.map((word) => {
                      return (
                        <Badge className="badge rounded-pill" bg="primary">
                          {word}: {recentSearch[word]}
                        </Badge>
                      );
                    })}
                </Stack>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row className="mb-2">
        <Card>
          <Card.Body>
            <Card.Title>Word Suggestions</Card.Title>

            {suggestedWords.map((data) => {
              const sugg = data.suggestions.dataList;
              console.log(sugg);

              const badges = sugg.map((wordData) => {
                return (
                  <ListGroup>
                    <ListGroup.Item>Frequency: {wordData["frequency"]}</ListGroup.Item>
                    <ListGroup.Item>
                      <Badge className="badge rounded-pill" bg="primary">
                              {wordData["word"]}
                            </Badge>
                    </ListGroup.Item>
                  </ListGroup>
                );
              });
              return (
                <Card.Text>
                  <Stack
                    style={{ flexWrap: "wrap" }}
                    direction="horizontal"
                    gap={2}
                  >
                    <h5>{data?.word}</h5>: {badges}
                  </Stack>
                  
                </Card.Text>
              );
            })}
            {/* <Card.Text>
              <Stack direction="horizontal" gap={2}>
                <Badge bg="primary">Primary</Badge>
                <Badge bg="secondary">Secondary</Badge>
              </Stack>
            </Card.Text> */}
          </Card.Body>
        </Card>
      </Row>
      <Row className="mb-2">
        <Card>
          <Card.Body>
            <Card.Title>Spell Checker</Card.Title>
            <Card.Text>
                {correctWords.map((word) => {
                  if (word.correctWords !== null) {
                    const result = Object.keys(word.correctWords).map((key)=>{
                      const data = word.correctWords[key];
                      const countKeys = Object.keys(data).map((d)=>Number(d));
                      const maxCount = Math.max(...countKeys);
                      const wordArray = data[maxCount];

                      return (
                        <ListGroup>
                          <ListGroup.Item>EditCost: {key}</ListGroup.Item>
                          <ListGroup.Item>Frequency: {maxCount}</ListGroup.Item>
                          <ListGroup.Item>
                            <Stack direction="horizontal" gap={2}>
                              {wordArray.map((word) => {
                                return (
                                  <Badge
                                    className="badge rounded-pill"
                                    bg="primary"
                                  >
                                    {word}
                                  </Badge>
                                );
                              })}
                            </Stack>
                          </ListGroup.Item>
                        </ListGroup>
                      );

                    })
                    console.log(result);
                    
                    return (
                      <>
                        <h5 className="d-flex">{word.word}</h5>
                        <Stack direction="horizontal" gap={2}>
                          {result}
                        </Stack>
                      </>
                    );
                  } else {
                    return (
                      <div>
                        <h5>{word.word}</h5>
                        <p>Search terms are correct</p>
                      </div>
                    );
                  }
                })}
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
