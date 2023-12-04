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
  const [topJobList, setTopJobList] = useState([]);
  const [suggestedWords, setSuggestedWords] = useState([]);
  const [recentSearch, setRecentSearch] = useState([]);
  const [correctWords, setCorrectWords] = useState([]);
  const [triggerRecentSearch, setTriggerRecentSearch] = useState(true);
  const [crawlInput, setCrawlInput] = useState({});
  const [runTimes, setRunTimes] = useState({
    quickSort: 0,
    binarySearch: 0,
    mergeSort: 0,
  });
  const [invalidSearch, setInvalidSearch] = useState(false);

  const getRunTimes = (searchTerms) => {
    fetch("http://localhost:8080/api/runTimes", {
      method: "POST",
      headers: new Headers({
        "Content-Type": "application/x-www-form-urlencoded", // <-- Specifying the Content-Type
      }),
      body: `searchTerm=${searchTerms}`,
    }).then(async (data) => {
      const response = await data.json();
      console.log(response);
      setRunTimes(response);
    });
  };

  const setCrawlInputValues = (data) => {
    setCrawlInput((currentState) => {
      return { ...currentState, searchTerms: data };
    });
  };
  const crawl = (event) => {
    console.log(typeof event);

    if (!event) return;
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
    } else if (event.target.id == "job-DeleteJSON") {
      setCrawlInput((currentState) => {
        return { ...currentState, delete: event.target.checked };
      });
    }
  };

  const onCrawl = () => {
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
  };

  const getJobs = (searchTerms) => {
    fetch("http://localhost:8080/api/pageRanking/searchJobs", {
      method: "POST",
      headers: new Headers({
        "Content-Type": "application/x-www-form-urlencoded", // <-- Specifying the Content-Type
      }),
      body: `searchTerm=${searchTerms}`,
    }).then(async (data) => {
      const response = await data.json();
      console.log("JobData", response);
      setJobList(response["dataList"]);
      setTriggerRecentSearch((currentState) => {
        return !currentState;
      });
    });
  };

  const getTopJobs = (searchTerms) => {
    fetch("http://localhost:8080/api/pageRanking/searchJobs", {
      method: "POST",
      headers: new Headers({
        "Content-Type": "application/x-www-form-urlencoded", // <-- Specifying the Content-Type
      }),
      body: `searchTerm=${searchTerms}&sortBy=salary`,
    }).then(async (data) => {
      const response = await data.json();
      console.log(response);
      setTopJobList(response["dataList"]);
    });
  };

  const onSearch = () => {
    setInvalidSearch(false);
    fetch("http://localhost:8080/api/correctWords", {
      method: "POST",
      headers: new Headers({
        "Content-Type": "application/x-www-form-urlencoded", // <-- Specifying the Content-Type
      }),
      body: `searchTerm=${searchInput}&suggestionCount=${6}`,
    }).then(async (data) => {
      const response = await data.json();
      console.log("Correct Words: ", response);
      if (
        response.length == 1 &&
        (response[0].isValidResponse == false ||
          response[0].validResponse == false)
      ) {
        setRunTimes({
          quickSort: 0,
          binarySearch: 0,
          mergeSort: 0,
        });
        setJobList([]);
        setTopJobList([]);
        setInvalidSearch(true);
        setCorrectWords([]);
      } else {
        setCorrectWords(response);

        let correctWords = response
          .map((data) => {
            if (data.correctWords == null) {
              return data.word;
            }
          })
          .filter((data) => data != undefined);

        console.log("correct:", correctWords.length);

        if (correctWords.length == 0) {
          setRunTimes({
            quickSort: 0,
            binarySearch: 0,
            mergeSort: 0,
          });
          setJobList([]);
          setTopJobList([]);
          setInvalidSearch(true);
          return;
        }
        correctWords = correctWords.join(" ");
        getRunTimes(correctWords);
        getTopJobs(correctWords);
        getJobs(correctWords);
      }
    });
  };

  useEffect(() => {
    console.log("recent useEffect");

    fetch("http://localhost:8080/api/recentSearches", {
      method: "Get",
    }).then(async (data) => {
      const response = await data.json();
      console.log("recent", response);
      setRecentSearch(response["dataList"]);
    });
  }, [triggerRecentSearch]);

  useEffect(() => {
    console.log("executed");
    const timeoutFunction = setTimeout(() => {
      fetch("http://localhost:8080/api/wordSuggestions", {
        method: "POST",
        headers: new Headers({
          "Content-Type": "application/x-www-form-urlencoded",
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

  return (
    <Container className="vw-100 py-4 justify-center align-items-start">
      <h2 className="text-center">Salary Stratos</h2>
      <Tabs defaultActiveKey="searchEngine" className="mb-3">
        <Tab eventKey="searchEngine" title="Search Engine">
          <Row className="mb-3" xs="auto">
            <Col lg={10} className="px-0">
              <Form>
                <Form.Group className="w-100" controlId="jobSearch">
                  <Form.Control
                    size="lg"
                    type="text"
                    placeholder="Enter keywords to search"
                    value={searchInput}
                    onChange={(e) => {
                      setSearchInput(e.target.value);
                      setSuggestedWords([]);
                      setCorrectWords([]);
                      setJobList([]);
                      setTopJobList([]);
                    }}
                  />
                  {invalidSearch && (
                    <Form.Text muted>
                      Cannot be empty or have Invalid terms.
                    </Form.Text>
                  )}
                </Form.Group>
              </Form>
            </Col>
            <Col lg={2} className="pl-2">
              <Button className="" onClick={() => onSearch()} variant="primary">
                Search
              </Button>
            </Col>
          </Row>
          <Row className="mb-2">
            <Card className="mb-2">
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
                            <Badge className="badge rounded-pill" bg="primary">
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
            <Card className="mb-2">
              <Card.Body>
                <Card.Title>Word Suggestions</Card.Title>

                {suggestedWords.map((data) => {
                  const sugg = data.suggestions.dataList;

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

                      return (
                        <div className="py-2">
                          <h5 className="d-flex">{word.word}: </h5>
                          <Stack direction="horizontal" gap={2}>
                            {result}
                          </Stack>
                        </div>
                      );
                    } else {
                      return (
                        <div className="py-2">
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
              marginTop: "2rem",
            }}
          >
            <Card className="mb-2">
              <Card.Body>
                <Row>
                  <Card.Title>
                    Time taken by
                  </Card.Title>
                  <Col lg={4}>
                    <Card.Title>
                      QuickSort: {runTimes.quickSort} ns
                    </Card.Title>
                  </Col>
                  <Col lg={4}>
                    <Card.Title>
                      MergeSort: {runTimes.mergeSort} ns
                    </Card.Title>
                  </Col>
                  <Col lg={4}>
                    <Card.Title>
                      SortedArray: {runTimes.binarySearch} ns
                    </Card.Title>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Row>
          <Row
            style={{
              marginTop: "2rem",
            }}
          >
            <h3>Page Ranking</h3>
          </Row>
          <Row
            style={{
              padding: "2rem",
              border: "1px solid lightgray",
              borderRadius: "0.5rem",
              maxHeight: "600px",
              overflowY: "auto",
            }}
          >
            <Col>
              {jobList.length > 0 ? (
                jobList.map((data, index) => {
                  return (
                    <Card style={{ minHeight: "100px", marginBottom: "2rem" }}>
                      <Card.Body>
                        <Row className="my-2">
                          <Col>
                            <Badge className="badge rounded-pill" bg="primary">
                              <b>Rank: </b>
                              {index + 1}
                            </Badge>
                          </Col>
                        </Row>
                        <Row>
                          <Col lg={8}>
                            <Card.Title>{data.jobTitle}</Card.Title>
                          </Col>
                          <Col lg={4}>
                            <Card.Title>
                              <ListGroup>
                                <ListGroup.Item>
                                  Search term occurrences: {data.wordFrequency}
                                </ListGroup.Item>
                                <ListGroup.Item>
                                  <Stack direction="horizontal" gap={2}>
                                    {data.word.split(", ").map((word) => {
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
                            </Card.Title>
                          </Col>
                        </Row>

                        <Row>
                          <Col>
                            <b>Location: </b>
                            {data.location}
                          </Col>
                          <Col style={{ textAlign: "end" }}>
                            <b>Salary: </b>
                            {data.maxSalary}
                          </Col>
                        </Row>
                        <Card.Text></Card.Text>
                        <Accordion>
                          <Accordion.Item eventKey="0">
                            <Accordion.Header>Description</Accordion.Header>
                            <Accordion.Body>
                              {data.jobDescription}
                            </Accordion.Body>
                          </Accordion.Item>
                        </Accordion>
                        <Row className="mt-2">
                          <Col lg={6}>
                            <a
                              href={data.jobWebsiteLink}
                              className="btn btn-primary"
                              target="_blank"
                            >
                              {data.jobWebsiteName}
                            </a>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  );
                })
              ) : (
                <h3 className="text-center">No Jobs to show</h3>
              )}
            </Col>
          </Row>
          <Row
            style={{
              marginTop: "2rem",
            }}
          >
            <h3>Top Ranking Jobs by Salary</h3>
          </Row>
          <Row
            style={{
              padding: "2rem",
              border: "1px solid lightgray",
              borderRadius: "0.5rem",
              maxHeight: "600px",
              overflowY: "auto",
            }}
          >
            <Col>
              {topJobList.length > 0 ? (
                topJobList.map((data, index) => {
                  return (
                    <Card style={{ minHeight: "100px", marginBottom: "2rem" }}>
                      <Card.Body>
                        <Row className="my-2">
                          <Col>
                            <Badge className="badge rounded-pill" bg="primary">
                              <b>Rank: </b>
                              {index + 1}
                            </Badge>
                          </Col>
                        </Row>
                        <Row>
                          <Col lg={8}>
                            <Card.Title>{data.jobTitle}</Card.Title>
                          </Col>
                          <Col lg={4}>
                            <Card.Title>
                              <ListGroup>
                                <ListGroup.Item>
                                  Search term occurrences: {data.wordFrequency}
                                </ListGroup.Item>
                                <ListGroup.Item>
                                  <Stack direction="horizontal" gap={2}>
                                    {data.word.split(", ").map((word) => {
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
                            </Card.Title>
                          </Col>
                        </Row>

                        <Row>
                          <Col>
                            <b>Location: </b>
                            {data.location}
                          </Col>
                          <Col style={{ textAlign: "end" }}>
                            <b>Salary: </b>
                            {data.maxSalary}
                          </Col>
                        </Row>
                        <Card.Text></Card.Text>
                        <Accordion>
                          <Accordion.Item eventKey="0">
                            <Accordion.Header>Description</Accordion.Header>
                            <Accordion.Body>
                              {data.jobDescription}
                            </Accordion.Body>
                          </Accordion.Item>
                        </Accordion>
                        <Row className="mt-2">
                          <Col lg={6}>
                            <a
                              href={data.jobWebsiteLink}
                              className="btn btn-primary"
                              target="_blank"
                            >
                              {data.jobWebsiteName}
                            </a>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  );
                })
              ) : (
                <h3 className="text-center">No Jobs to show</h3>
              )}
            </Col>
          </Row>
        </Tab>
        <Tab eventKey="crawler" title="Crawler">
          <Row className="vw-90 mb-3" xs="auto">
            <Col lg={12} className="mb-2">
              <Multiselect setCrawlInput={setCrawlInputValues} />
            </Col>
            <Col className="d-flex align-items-center">
              <Form className="d-flex">
                {["SimplyHired", "RemoteOk", "GlassDoor", "DeleteJSON"].map(
                  (type) => (
                    <div key={`job-${type}`}>
                      <Form.Check
                        type="checkbox"
                        id={`job-${type}`}
                        label={`${type}`}
                        className="mx-2"
                        onChange={(e) => crawl(e)}
                      />
                    </div>
                  )
                )}
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
