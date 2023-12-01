import { useEffect, useState } from "react";
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
  Tab,
  Tabs,
} from "react-bootstrap";
import Multiselect from "../components/Multiselect";

function SalaryStratos() {
  const [searchInput, setSearchInput] = useState("");
  const [jobList, setJobList] = useState([]);
  const [suggestedWords, setSuggestedWords] = useState([]);
  const [recentSearch, setRecentSearch] = useState([]);
  const [correctWords, setCorrectWords] = useState([]);
  const [triggerRecentSearch, setTriggerRecentSearch] = useState(true);
  const [crawlInput, setCrawlInput] = useState({});
 const setCrawlInputValues = (data)=>{
   setCrawlInput((currentState) => {
        return { ...currentState, "searchTerms": data };
      });
 }
  const crawl = (event) => {
    console.log(typeof event);
    
    if (!event) return
    if (event.target.id == "job-SimplyHired") {
      setCrawlInput((currentState) => {
        return { ...currentState, simplyHired: event.target.checked };
      });
    } else if (event.target.id == "job-RemoteOk") {
      setCrawlInput((currentState) => {
        return { ...currentState, remoteOk: event.target.checked };
      });
    } else if (event.target.id == "job-GlassDoor") {
      setCrawlInput((currentState) => {
        return { ...currentState, glassDoor: event.target.checked };
      });
    }
  };

  const onCrawl = ()=>{
    fetch("http://localhost:8080/api/crawl", {
      method: "POST",
      headers: new Headers({
        "Content-Type": "application/json", // <-- Specifying the Content-Type
      }),
      body: JSON.stringify(crawlInput),
    }).then(async (data) => {
      const response = await data.json();
      console.log(response);
    });
  }

  const getJobs = (searchTerms) => {
    fetch("http://localhost:8080/api/pageRanking/searchJobs", {
      method: "POST",
      headers: new Headers({
        "Content-Type": "application/x-www-form-urlencoded", // <-- Specifying the Content-Type
      }),
      body: `searchTerm=${searchTerms}`,
    }).then(async (data) => {
      const response = await data.json();
      console.log(response);
      setJobList(response["dataList"]);
      setTriggerRecentSearch((currentState) => {
        return !currentState;
      });
    });
  };

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

      let correctWords = response.map((data) => {
        if (data.correctWords == null) {
          return data.word;
        }
      });

      correctWords = correctWords.join(" ");
      getJobs(correctWords);
    });
  };

  useEffect(() => {
    fetch("http://localhost:8080/api/recentSearches", {
      method: "Get",
    }).then(async (data) => {
      const response = await data.json();
      console.log(response);
      setRecentSearch(response["dataList"]);
    });
  }, [triggerRecentSearch]);

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

  // const searchForJobs = () => {
  //   fetch("http://localhost:8080/api/wordSuggestions", {
  //     method: "POST",
  //     body: searchInput,
  //   }).then(async (data) => {
  //     const result = await data.json();
  //     console.log(result);
  //   });
  // };

  return (
    <Container className="vw-100 p-4 justify-center align-items-start">
      <h2 className="text-center">Salary Stratos</h2>
      <Tabs defaultActiveKey="searchEngine" className="mb-3">
        <Tab eventKey="searchEngine" title="Search Engine">
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
            <Col lg={1} className="pl-2">
              <Button
                className="p-3"
                onClick={() => onSearch()}
                variant="primary"
              >
                Search
              </Button>
            </Col>
            <Col lg={6} className="p-0">
              <Card>
                <Card.Body>
                  <Card.Title>Recent Searches With Frequency Count</Card.Title>
                  <Card.Text>
                    <Stack
                      style={{ flexWrap: "wrap" }}
                      direction="horizontal"
                      gap={2}
                    >
                      {recentSearch.map((word) => {
                        return (
                          <ListGroup>
                            <ListGroup.Item>
                              Frequency: {word["frequency"]}
                            </ListGroup.Item>
                            <ListGroup.Item>
                              <Badge
                                className="badge rounded-pill"
                                bg="primary"
                              >
                                {word["word"]}
                              </Badge>
                            </ListGroup.Item>
                          </ListGroup>
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
                        <ListGroup.Item>
                          Frequency: {wordData["frequency"]}
                        </ListGroup.Item>
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
                      const result = Object.keys(word.correctWords).map(
                        (key) => {
                          const data = word.correctWords[key];
                          const countKeys = Object.keys(data).map((d) =>
                            Number(d)
                          );
                          const maxCount = Math.max(...countKeys);
                          const wordArray = data[maxCount];

                          return (
                            <ListGroup>
                              <ListGroup.Item>EditCost: {key}</ListGroup.Item>
                              <ListGroup.Item>
                                Frequency: {maxCount}
                              </ListGroup.Item>
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
                        }
                      );
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
                          <h5>{word.word}:</h5>
                          <p>Search term is correct</p>
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
              padding: "2rem",
              marginTop: "2rem",
              border: "1px solid lightgray",
              borderRadius: "0.5rem",
            }}
          >
            {jobList.length > 0 ? (
              jobList.map((data) => {
                return (
                  <Card style={{ minHeight: "100px", marginBottom: "2rem" }}>
                    <Card.Body>
                      <Row>
                        <Col>
                          <Card.Title>{data.jobTitle}</Card.Title>
                        </Col>
                        <Col style={{ textAlign: "end" }}>
                          <Card.Title>
                            {data.word}: {data.wordFrequency}
                          </Card.Title>
                        </Col>
                      </Row>

                      <Row>
                        <Col>{data.location}</Col>
                        <Col style={{ textAlign: "end" }}>{data.maxSalary}</Col>
                      </Row>
                      <Card.Text></Card.Text>
                      <Accordion>
                        <Accordion.Item eventKey="0">
                          <Accordion.Header>Description</Accordion.Header>
                          <Accordion.Body>{data.jobDescription}</Accordion.Body>
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
        </Tab>
        <Tab eventKey="crawler" title="Crawler">
          <Row className="vw-90 mb-3" xs="auto">
            <Col lg={12} className="mb-2">
              <Multiselect setCrawlInput={setCrawlInputValues} />
            </Col>
            <Col className="d-flex align-items-center">
              <Form className="d-flex">
                {["SimplyHired", "RemoteOk", "GlassDoor"].map((type) => (
                  <div key={`job-${type}`}>
                    <Form.Check
                      type="checkbox"
                      id={`job-${type}`}
                      label={`${type}`}
                      className="mx-2"
                      onChange={(e) => crawl(e)}
                    />
                  </div>
                ))}
              </Form>
            </Col>
            <Col className="d-flex pl-2 align-middle">
              <Button onClick={() => onCrawl()} variant="primary">
                Crawl
              </Button>
            </Col>
          </Row>
        </Tab>
      </Tabs>
    </Container>
  );
}

export default SalaryStratos;
