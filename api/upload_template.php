<?php
header('Content-Type: application/json');

$target_dir = "../templates/";
if (!file_exists($target_dir)) {
    mkdir($target_dir, 0777, true);
}

if (!isset($_FILES["template"])) {
    echo json_encode(["success" => false, "error" => "No file uploaded"]);
    exit;
}

$file = $_FILES["template"];
$fileName = basename($file["name"]);
$target_file = $target_dir . $fileName;
$imageFileType = strtolower(pathinfo($target_file, PATHINFO_EXTENSION));

// Check if image file is a actual image or fake image
$check = getimagesize($file["tmp_name"]);
if($check === false) {
    echo json_encode(["success" => false, "error" => "File is not an image."]);
    exit;
}

// Allow certain file formats
if($imageFileType != "jpg" && $imageFileType != "png" && $imageFileType != "jpeg" && $imageFileType != "webp" ) {
    echo json_encode(["success" => false, "error" => "Only JPG, JPEG, PNG & WEBP files are allowed."]);
    exit;
}

if (move_uploaded_file($file["tmp_name"], $target_file)) {
    echo json_encode([
        "success" => true, 
        "file" => $fileName, 
        "path" => "templates/" . $fileName
    ]);
} else {
    echo json_encode(["success" => false, "error" => "Sorry, there was an error uploading your file."]);
}
?>
