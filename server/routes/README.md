### API documentation

#### Quiz

1.  `POST /api/quiz/generate`

    - Request body:
      ```json
      {
        "title": "Quiz title",
        "topic": "Quiz topic",
        "domain": "Quiz domain",
        "difficulty": "Quiz difficulty",
        "tags": ["tag1", "tag2", "tag3"]
      }
      ```
    - Sample response:
      ```json
      {
        "quiz": {
          "_id": "67d0aed45b8c92cac64361a8",
          "title": "Quiz on Computer Science - OOPD",
          "questions": [
            {
              "_id": "67d0aed45b8c92cac643618a",
              "question": "What is encapsulation in the context of object-oriented programming?",
              "options": [
                "A) The process of creating new objects",
                "B) Bundling data and methods that operate on that data within a class",
                "C) The inheritance of properties from a parent class",
                "D) The act of deleting an object from memory"
              ],
              "tags": [
                "Object Oriented Design",
                "Object Oriented Programming",
                "OOP"
              ],
              "domain": "Computer Science - OOPD",
              "**v": 0
            },
            // more questions...
          ],
          "tags": [
            "Object Oriented Design",
            "Object Oriented Programming",
            "OOP"
          ],
          "topic": "Encapsulation",
          "difficulty": "Intermediate",
          "domain": "Computer Science - OOPD",
          "attempts": [],
          "dateCreated": "2025-03-11T21:44:52.367Z",
          "dateModified": "2025-03-11T21:44:52.367Z",
          "**v": 0
        }
      }
      ```
      **Note**: We do not get correct answers in the response. Correct answers are stored in the database and are not returned in the response.

2.  `POST /api/quiz/submit` 
    - Request body:
        ```json
            {
                "quizId": "67d0aed45b8c92cac64361a8",
                "answers": [
                    "A",
                    "C",
                    "B"
                    // more answers...
                ]
            }
        ```


        **Note** - The order of answers should match the order of questions in the quiz. - The length of the `answers` array should match the number of questions in the quiz. - The `quizId` should be a valid quiz id. 
    
    - Sample response:
    
        ```json
            {
                "attempt": {
                    "quiz": "67d0aed45b8c92cac64361a8",
                    "user": "67d0aa8ff79448f420ea554a",
                    "answers": [
                        {
                            "question": {
                                "_id": "67d0aed45b8c92cac643618a",
                                "question": "What is encapsulation in the context of object-oriented programming?",
                                "options": [
                                    "A) The process of creating new objects",
                                    "B) Bundling data and methods that operate on that data within a class",
                                    "C) The inheritance of properties from a parent class",
                                    "D) The act of deleting an object from memory"
                                ],
                                "correctOption": "B",
                                "explanation": "Encapsulation is about protecting data by binding it with the methods that access and modify it, all within a class.",
                                "tags": [
                                    "Object Oriented Design",
                                    "Object Oriented Programming",
                                    "OOP"
                                ],
                                "domain": "Computer Science - OOPD",
                                "__v": 0
                            },
                            "answer": "A",
                            "_id": "67d0b0ae5b8c92cac64361b0"
                        },
                        // more answers...,
                    ]
                    "score": 7,
                    "\_id": "67d0b0ae5b8c92cac64361af",
                    "dateAttempted": "2025-03-11T21:52:46.472Z",
                    "\_\_v": 0
                }
            }
        ```

3. `GET /quiz-results/:userId` - Get all quiz results

4. `GET /user-quiz/:userId` - Get user with all quizes populated in the user object

Yes, there is no direct way to get result after submitting the quiz. You have to get all the quiz results and then filter out the result for the quiz you want to see the result for. This works for now but we will add a direct way to get the result for a quiz in the future.