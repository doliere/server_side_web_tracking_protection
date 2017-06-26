# Server-Side Protection against Third Party Web Tracking

# Introduction
This project deals with the problem of third party web tracking. Indeed, the web infrastructure allows a web application developer to reuse third party content in his own application by directly referencing them in an application. Though third party content provides tremendous benefit to application developers by allowing them to quickly build fully functional applications, it is also known that third party content poses serious security and privacy threats to users of such web applications. 

<p align="center">
  <img src="images/tracking.png?raw=true" alt="Third Party Web Tracking"/>
</p>

In particular, third party web tracking is a very common practice that many third party content providers have been found doing, putting users privacy at risk. In general, developers who rely on third party services in their applications, are solely interested in the content. Unfortunately, with the content can also come tracking. In this work, we propose a solution for web applications developers to use third party content, while preserving their users privacy by removing the tracking that can be done by the underlying third party content owners.


# Overview
We present a new web application architecture that allows web developers to gain control over certain types of third party content. In the traditional web application architecture, as depicted in the following figure, a web application developer has no control over third party content. This allows the exchange of tracking information between the browser and the third party as illustrated above.
<p align="center">
  <img src="images/tarchitecture-2.png?raw=true" alt="Traditional Web Application Architecture"/>
</p>

To prevent this, our solution is based on the automatic rewriting of the web application in such a way that the third party requests are redirected to a trusted third party server, called the Middle Party Server. It may be either controlled by a trusted party, or by a main site owner and automatically eliminates third-party tracking cookies and other technologies that may be exchanged by the browser and third party server

<p align="center">
  <img src="images/narchitecture-2.png?raw=true" alt="Tracking Prevention Web Application Architecture"/>
</p>

The Rewrite Server is another important component of this new architecture. It takes care of automatically rewritting all the web pages, so that all third party content that they are embed, will be fetched through the Middle Party Server. Therefore, the web developer does not need to modify his original application. He just deploys the Rewrite Server which will perform the necessary modifications for him. Take a look at how to deploy this solution for your own application.

# Motivation
<p align="right">
  <img src="images/eprivacy.png?raw=true" alt="ePrivacy: from directive to regulation" width="40%"/>
</p>
Third party tracking has become a great concern. Except for ethical decision not to track users, from May 2018 the website owners will have a legal obligation as well. The ePrivacy directive (also know as ‘cookie law’) will be updated to the regulation, and will make website owners liable for third party tracking that takes place in their websites. This regulation will be applied to all the services that are delivered to the natural persons located in the European Union. This regulation will apply high penalties for any violation. Hence, privacy compliance will be of high interest to all website owners and developers, and today there is no automatic tool that can help to control third party tracking.To keep a promise of non-tracking, the only solution today is to exclude any third-party content, thus trading functionality for privacy.

# Implementation, Evaluation

We have implemented the Rewrite Server and the Middle Party Server as [Node.js](https://nodejs.org) web servers.
We then deployed the solution on our demo web application embedding various third party contents. We have been able to successfully rewrite and redirect third party content to the Middle Party deployed at https://sstp-middleparty.inria.fr in order to remove any tracking. 

The following picture shows that all third party content are effectively being fetched through the Middle Party Server
<p align="center">
  <img src="images/screenshot.png?raw=true" alt="Screenshot of impplementation"/>
</p>

# Case Study
Finally, we evaluated the solution on the following websites. To do so, we have put all the logic of the Rewrite Server in a browser proxy where we rewrite web pages. As such, we have been able to evaluate the solution for some HTTP websites, preserving their intended functionalities and removing tracking from third party content that they embed. The sites we have considered are:
[BBC.com](http://www.bbc.com), [IMDB](http://www.imdb.com) and [Vertbaudet](http://www.vertbaudet.fr)

# Deployment
Instructions for deploying the Rewrite Server are detailed in [RewriteServer.md](RewriteServer.md).
Similarly, [MiddlePartyServer.md](MiddlePartyServer.md) explains how to deploy the Middle Party Server.

# Contact
[Dolière Francis Somé](http://www-sop.inria.fr/members/Doliere.Some/) <br>
[Nataliia Bielova](http://www-sop.inria.fr/members/Nataliia.Bielova/) <br>
[Tamara Rezk](http://www-sop.inria.fr/lemme/Tamara.Rezk/)



