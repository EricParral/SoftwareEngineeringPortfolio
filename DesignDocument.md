# UVUAdvisorBot Design Document
## Introduction
 UVUAdvisor is an advanced software system developed by Utah Valley University to provide comprehensive advising services to students. It applies artifical intelligence and integrates a univeristy database in order to suggest personalized academic guidance. This document will outline the architecure and functions of the UVUAdvisorBot.

 ## Architecture
 UVUAdvisorBot will include the following compenents:
 - Chat Interface: Provides an UI for student to interactwith with text inputs
 - Recommendation Engine: Anazlyzes student record and suggests suitable courses and academic plans
 - Intergration with Systems: Interfaces with univeristy systems in order to be accessible



## Functionalities
### Personalized Course Reccomendations
UVUAdvisorBot will anazyle a students academic records and will provide a personalized course reccomendations. It will also consider factors like course difficulty, historical grade distributions, and faculty reviews. 

### Real-Time Prerequisite Checks
For any selected course, the bot instantly verifies prerequisite requirements and offers alternatives or prerequisite waiver procedures if applicable.

### Interactive FAQ
UVUAdvisorBot provides instant responses to queries about campus life, admission processes, financial aid, housing, student clubs, and more. It connects to various university department databases to handle complex queries.

## User Stories
1. As a student, I want personalized course reccomendations based on my interests.
2. As a prospective student, I want to learn more about finacial aid options and campus facilities

## Use Cases

1. **Handling Course Reccomendations**
    - Input: Student academic records and preferences
    - Output: Recommended courses with details

2. **Update Academic Plans**
    - Input: Student preferences and graduation timeline
    - Output: Semester-wise academic plan

3. **Verifying Prerequisits**
    - Input: Selected course
    - Output: Prerequisite check result

4. **Finacial Aid Inquiry**
    - Input: Student preferences
    - Output: Finacial Aid options

5. **Housing Inquiry**
    - Input: Student preferences
    - Output: On-campus housing requirements and options

6. **Student Club Inquiry**
    - Input: Student Preferences
    - Output: List of Clubs based on Student Preferences

7. **Graduation Timeline Inquiry**
    - Input: Student Question about Academic History/Future
    - OutPut: Personalized Academic Timeline

8. **Campus Life Inquiry**
    - Input: Student Preference
    - Output: Result 

9. **Integration with Student Portal**
    - Input: Student login credentials
    - Output: Access to student records for updating academic plans

10. **Integration with Administrative Databases**
    - Input: Course catalogs, student records
    - Output: Fetch relevant data for recommendations and updates





