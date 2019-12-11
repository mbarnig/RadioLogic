# RadioLogic
RadioLogic is a case-based learning and self-assessment tool for the Orthanc Ecosystem for Medical Imaging.

Case-based learning (CBL) is an efficient method for radiologist education. RadioLogic is a system to create clinical-cases from real DICOM files and to provide a self-assessment tool to users to view the studies, submit a diagnosis and compare their performance with other peers. The main components are a progressive web application (RadioLogicTutor) optimized for iPAD's, an Orthanc PACS (RadioLogicArchive) to serve the teaching files and an Orthanc plugin (RadioLogicCreator) to create the clinical teaching cases. 

The identified user (local login) selects a learning module, views the related cases in an embedded DICOM viewer (based on the CornerstoneJS framework), submits his diagnosis and checks the results.

![radiologictutor](https://github.com/mbarnig/RadioLogic/blob/master/Pictures/radiologictutor.png) 

The teacher selects a real patient, study, series or instance inside an Orthanc server with the embedded RadioLogicCreator plugin to start the creation of a clinical case in the related webpage, hosted in the Orthanc serve-folder. He enters the name of the clinical case, his name, the multiple choices for a suggested diagnosis, the correct answer, an image with a description of the clinical data (observations) and an image with explanations (answer) concerning the correct diagnosis.

![radiologiccreator](https://github.com/mbarnig/RadioLogic/blob/master/Pictures/radiologiccreator.png)

The DICOM type, Orthanc UID, date, etc are inserted automatically. After validation and submission of the data, a new asynchronous job is started in the Orthanc job engine to anonymize, customize, compress (JPEG 2000) and rescale instances with large images (CT modalities). Two additional DICOM files are generated with the observation and answer images. Both contain private tags to hold the entered data. The answer image and tags are scrambled to prevent the user viewing the results before submitting his own diagnosis. Instead of selecting saved DICOM files, the RadioLogicCreator provides an option to upload new files recursively to the Orthanc server by dragging and dropping nested DICOM folders to the related input field. These files are listed in a DICOM directory tree to check them before submission to create a new clinical case.

The related Wiki of this repository provides more information about the different components of the RadioLogic system. You will find also a small tutorial how to install and operate an Orthanc server in a Docker container and how to develop some simple Orthanc plugins. If you are interested, please visit the [Wiki Home page](https://github.com/mbarnig/RadioLogic/wiki) to see the summary.
