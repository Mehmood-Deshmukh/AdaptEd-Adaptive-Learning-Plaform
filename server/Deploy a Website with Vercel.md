### Deploy a Website with Vercel
[https://www.codedex.io/projects/deploy-a-website-with-vercel](https://www.codedex.io/projects/deploy-a-website-with-vercel)
Tags: JS, Intermed.
![Deploy a Website with Vercel](https://www.codedex.io/images/projects/card_images/deploy-vercel-project.png)

#### Prerequisites:
Prerequisites: Git, GitHub
Read Time: 20 minutes

### # Introduction
So you've created a website on your computer; how do you get it live on the web for your friends to visit with a URL?
Hello everyone! In this tutorial, I will be teaching you how to deploy your very own website using Vercel! This will allow anyone to visit your published website on the internet. 🌐
We'll help you get started to easily deploy your website and get it ⭐️ live ⭐️ in no time!

### # What is Vercel?
We keep using the word deploy, what does it even mean? Deploying — or pushing new code to a server — is an integral part of a developer’s daily workflow (develop ➡️ test ➡️ deploy).
Vercel is a cloud platform that specializes in serverless deployment and static site hosting. It allows developers to easily deploy and host web applications, APIs, and static websites!
Fun Fact: Vercel was originally known as "Zeit" before it rebranded itself in 2020. It was founded by Guillermo Rauch, who also created Socket.IO (we have a tutorial about this, too).

### # Getting Started with Vercel
Vercel lets us deploy a static website that consists of fixed content and doesn't require server-side processing or a dynamic server to generate web pages. Instead, all the content of a static website is pre-built and stored as HTML, CSS, JavaScript, images, and other assets.
This tutorial works with code that is pushed to a repository (repo) on GitHub.
Before we begin, let's do the following:
Note: If you aren't sure of how to add your project to a GitHub repository, follow these instructions on adding locally hosted code to GitHub.
Let's head over to Vercel and log in with your GitHub account.
![Vercel Intro](https://raw.githubusercontent.com/codedex-io/projects/main/projects/deploy-a-website-with-vercel/images/vercel-intro.png)
Once you have authenticated your GitHub account, the screen should now look like this:
![Vercel Authed](https://raw.githubusercontent.com/codedex-io/projects/main/projects/deploy-a-website-with-vercel/images/vercel-authed.png)
In the Vercel dashboard, you may notice some repositories that were recently committed to! ⭐️

### # Deploying Your Website
At this point, depending on your project, it should be able to display and work locally on your computer. Below is a linktr.ee clone that I created!
![Vercel Pre App Demo](https://raw.githubusercontent.com/codedex-io/projects/main/projects/deploy-a-website-with-vercel/images/vercel-pre-app-demo.gif)
You'll see that my website is currently on the http://localhost:3000, in which the computer has the role of a virtual server that is running my code. Let's go ahead and use Vercel to deploy the site!
We're going to head back, and select the GitHub repository that has the project you want to publish by pressing the white "Import" button.
![Vercel Pre Deploy](https://raw.githubusercontent.com/codedex-io/projects/main/projects/deploy-a-website-with-vercel/images/vercel-pre-deploy.png)
My repository is called "bento" (view the repository here)! You'll be able to reconfigure the name of your project here (this will be the prefix name to your publishing link such as "bento-blonde.vercel.app").
You'll also notice some other settings before deploying such as:
Since we're deploying a static site, we won't need to change this information.
This static website was created with Next.js, a React-based web framework. However, you can change the framework that you're using for deployment. Vercel should detect this automatically, but here are some of the options that you will see under "Framework Preset":
![Vercel FW Demo](https://raw.githubusercontent.com/codedex-io/projects/main/projects/deploy-a-website-with-vercel/images/vercel-fw-demo.gif)
Note: If you are not using a framework, choose "Other" in "Framework Preset" and make sure an index.html file is included in the repo prior to deployment.
Once you're all set, you can now click "Deploy". You'll now notice the build process starting!
![Vercel Loading](https://raw.githubusercontent.com/codedex-io/projects/main/projects/deploy-a-website-with-vercel/images/vercel-loading.png)
This part can take a couple of minutes! Once the deployment is finished, you should see the congratulations screen! Yay! 🎉
![Vercel Congrats](https://raw.githubusercontent.com/codedex-io/projects/main/projects/deploy-a-website-with-vercel/images/vercel-congrats.png)
You're now able to access my linktr.ee clone website at bento-blond.vercel.app.
You'll notice your GitHub repository now looks a bit different! Vercel interacted with your GitHub repository to automate the deployment process and ensure that your website stays up-to-date with the latest changes in your codebase. So every time you push code to the main branch (or the branch specified in Vercel), you don't have to worry about updating it yourself every time! And that's it!

### # Conclusion
Congratulations! 🎉
You have successfully deployed your static website using Vercel and GitHub! Now, you can use your own domain if or create more websites to share with friends and family! 🤩
If you come across any trouble, you're welcome to send us a message in the Codédex Discord, and we'll help you out! Share any websites you deploy with me on Twitter and tag @codedex_io and @exrlla. ⭐️

#### Project Walkthrough
* Vercel Documentation
* Deploying to Vercel
* Static vs. Dynamic Websites
* What is Next.js?

#### More Resources
* Vercel Documentation
* Deploying to Vercel
* Static vs. Dynamic Websites
* What is Next.js?