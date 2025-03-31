# AdaptEd
AdaptEd is a web application designed to offer personalized and adaptive learning experience to students. It uses ai and machine learning algorithms to analyze students' learning patterns and provide tailored content and resources. The motivation was to address the problem of one-size-fits-all approach to education, which often fails to meet the individual needs of students. By leveraging technology, AdaptEd aims to create a more engaging and effective learning experience for students.

## Features
- **Roadmaps with tailored Resources**: Create personalized learning paths for students based on their individual needs and goals. Suggest resources and activities that align with their learning objectives and preferences.
- **Community Forum**: A platform for students to connect, share experiences, and seek help from peers. 
- **Realtime Chatroom**: A chatroom for students to ask questions and get help from peers in real-time. 
- **Progress Tracking**: Monitor students' progress and provide feedback on their performance. Use data analytics to identify areas for improvement and suggest targeted resources.
- **Gamification**: Incorporate game-like elements to make learning more engaging and motivating. Use badges, xp points, streaks and leaderboards to encourage students to complete tasks and achieve their goals.
- **Recommendations**: Generate personalized recommendations for students based on their learning patterns and preferences. Use machine learning algorithms to analyze data and suggest relevant resources and activities.
- **Adaptive Learning**: Continuously adapt the learning experience based on students' progress and feedback. Use data analytics to identify areas for improvement and suggest targeted resources.
- **Quizzes and challenges**: Create quizzes and challenges to test students' knowledge and skills. Use data analytics to identify areas for improvement and suggest targeted resources.
- **Feedback loop**: Let users provide feedback on the resources and activities suggested by the platform. Use this feedback to improve the recommendations and adapt the learning experience.
- **Community-Driven approach for Resources and Quizzes**: Allow users to contribute resources and quizzes to the platform. Use a community-driven approach to curate and validate the content. Idea was to create a diverse and rich learning experience for students. This is supported by the gamification feature, where users can earn points and badges for contributing content.

## Flow

1. **User Registration and Login**: Users can register and log in to the platform using their email and password.
2. **Initial assessment**: Users take an initial assessment to determine their learning style, preferences, and goals. This assessment is used to create a personalized learning path.
3. **Personalized Learning Path**: Based on the initial assessment, the platform generates a personalized learning path for each user. This path includes checkpoints, resources, and activities that align with the user's learning objectives and preferences.
4. **Challenges and quizzes**: Whenever user completes a checkpoint, they are presented with a challenge or quiz to test their knowledge and skills.
5. **Feedback Loop**: Users can provide feedback on the resources and activities suggested by the platform. This feedback is used to improve the recommendations and adapt the learning experience.
6. **Progress Tracking**: Users can track their progress and receive feedback on their performance. The platform uses data analytics to identify areas for improvement and suggest targeted resources.
7. **Streamlined Experience**: The platform tries to provide streamlined experience for users by locking certain features until the user gains enough experience points. This is done to ensure that users are not overwhelmed with too many features at once and can focus on their learning journey.
8. **Community Forum**: Users can connect with peers, share experiences, and seek help from the community. 

## Architecture

1. For resource recommendation, a vector database (FAISS) is used to store and retrieve resources based on user query. then the resources are ranked based on their complexity and relevance to the user. and then LLM is used to generate checkpoints for provided topic and then distribute the resources to the checkpoints.
2. For quiz generation, again a vector database (FAISS) is used to store questions and retrieve them based on user query. Questions also have metadata like topic, difficulty level, domain, tags, etc. then the retrieved questions are made into a quiz.
3. For overall database management, the mongodb is used to store user data, progress, and feedback. 
4. For chatroom, **Supabase Realtime** is used to provide real-time chat functionality.

## Tech Stack
- **Frontend**: ReactJS, Tailwind CSS
- **Backend**: Node.js, Express.js, Flask
- **Database**: MongoDB, FAISS
- **Authentication**: JWT, bcrypt
- **Real-time Chat**: Supabase Realtime

## Setup
1. Clone the repository
```bash
git clone https://github.com/Mehmood-Deshmukh/Inspiron-4.0
cd Inspiron-4.0
```
2. Install dependencies
- For frontend
```bash
cd client
npm install
```
- For NodeJs backend
```bash
cd server
npm install
```
- For Flask backend
```bash
cd python-server
```
if you are on linux, run the following command to create a virtual environment
```bash
python3 -m venv .venv
```
activate the virtual environment
```bash
source .venv/bin/activate
```
finally install the dependencies
```bash
pip install -r requirements.txt
```
3. Environment Variables
    - .env file for Frontend
    ```bash
    VITE_BACKEND_URL="http://localhost:3000"
    VITE_SUPABASE_URL=<supabase_url>
    VITE_SUPABASE_ANON_KEY=<supabase_anon_key>
    ```

    - .env file for NodeJs backend
    ```bash
    PORT=3000   
    MONGO_URI="mongodb://localhost:27017/adaptEd"
    DB_NAME="adaptEd"
    JWT_SECRET="THISISSOMESECRET"

    # these are for sending emails for resetting password
    EMAIL_USER=<Email>
    EMAIL_PASSWORD=<App_Password>

    GEMINI_API_KEY=<Gemini_API_Key>

    FLASK_BASE_URL='http://localhost:8000'
    ```

    - .env file for Flask backend
    ```bash
    GROQ_API_KEY=<Groq_API_Key>
    MONGO_URI="mongodb://localhost:27017/"
    DB_NAME="adaptEd"
    ```
4. Run the application
- For Frontend
```bash
cd client
npm run dev
```
- For NodeJs backend
```bash
cd server
npm run dev
```
- For Flask backend
```bash
cd python-server
python server.py
```
If you are on linux, you can directly run everything using the `start.sh` script.
Just make sure you have `tmux` installed. 
If you don't have it, you can install it using the following command (on Debian based distros)
```bash
sudo apt install tmux
```
Then run the following command to start the application
```bash
chmod +x start.sh
./start.sh
```
This will start the frontend, nodejs backend, and flask backend in separate tmux sessions. You can switch between the sessions using `Ctrl + b` and then `n` or `p` to go to next or previous session respectively.
You can also use `Ctrl + b` and then `s` to view the list of sessions.

## Contributing

Contributions are welcome! If you have any suggestions or improvements, feel free to open an issue or submit a pull request.

#### Steps to contribute
1. Fork the repository
2. Create a new branch
```bash
git checkout -b feature/your-feature-name
```
3. Make your changes
4. Commit your changes
```bash
git commit -m "Add your commit message"
```
5. Push to the branch
```bash
git push origin feature/your-feature-name
```
6. Create a pull request
7. Wait for review and feedback
8. Make changes if required
9. Once approved, your changes will be merged into the main branch

## Contributors
Made with ❤️ by
- Mehmood Deshmukh: [**LinkedIn**](https://www.linkedin.com/in/mehmood-deshmukh-93533a2a7/) | [**GitHub**](https://github.com/Mehmood-Deshmukh)
- Anjali Phule: [**LinkedIn**](https://www.linkedin.com/in/anjali-phule-0b1a2a1b4/) | [**GitHub**](https://github.com/im-anjali)
- Sayalee Khedekar [**LinkedIn**](https://www.linkedin.com/in/sayalee-khedekar-bb17b129b/) | [**GitHub**](https://github.com/sayalee16)
- Yashwant Bhosale [**LinkedIn**](https://www.linkedin.com/in/yashwant-bhosale-4ab062292/) | [**GitHub**](https://github.com/YashwantBhosale)
