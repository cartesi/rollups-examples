#include "opencv2/opencv.hpp"
#include <opencv2/highgui.hpp>
#include <limits>
#include <fstream>


using namespace cv;
using namespace std;

template <typename _Tp>
void OLBP_(const Mat& src, Mat& dst) {
	dst = Mat::zeros(src.rows - 2, src.cols - 2, CV_8UC1);
	for (int i = 1; i < src.rows - 1; i++) {
		for (int j = 1; j < src.cols - 1; j++) {
			_Tp center = src.at<_Tp>(i, j);
			unsigned char code = 0;
			code |= (src.at<_Tp>(i - 1, j - 1) > center) << 7;
			code |= (src.at<_Tp>(i - 1, j) > center) << 6;
			code |= (src.at<_Tp>(i - 1, j + 1) > center) << 5;
			code |= (src.at<_Tp>(i, j + 1) > center) << 4;
			code |= (src.at<_Tp>(i + 1, j + 1) > center) << 3;
			code |= (src.at<_Tp>(i + 1, j) > center) << 2;
			code |= (src.at<_Tp>(i + 1, j - 1) > center) << 1;
			code |= (src.at<_Tp>(i, j - 1) > center) << 0;
			dst.at<unsigned char>(i - 1, j - 1) = code;
		}
	}
}
Mat asRowMatrix(const vector<Mat>& src, int rtype, double alpha, double beta) {
	// number of samples
	size_t n = src.size();
	// return empty matrix if no matrices given
	if (n == 0)
		return Mat();
	// dimensionality of (reshaped) samples
	size_t d = src[0].total();
	// create data matrix
	Mat data(n, d, rtype);
	// now copy data
	for (int i = 0; i < n; i++) {
		// make sure data can be reshaped, throw exception if not!
		if (src[i].total() != d) {
			string error_message = format("Wrong number of elements in matrix #%d! Expected %d was %d.", i, d, src[i].total());
			CV_Error(cv::Error::StsBadArg, error_message);
		}
		// get a hold of the current row
		Mat xi = data.row(i);
		// make reshape happy by cloning for non-continuous matrices
		if (src[i].isContinuous()) {
			src[i].reshape(1, 1).convertTo(xi, rtype, alpha, beta);
		}
		else {
			src[i].clone().reshape(1, 1).convertTo(xi, rtype, alpha, beta);
		}
	}
	return data;
}
Mat histogram(cv::Mat image)
{
	int histSize = 59;
	float range[] = { 0, 58 };
	const float* histRange = { range };

	bool uniform = true; bool accumulate = false;

	Mat hist;

	calcHist(&image, 1, 0, Mat(), hist, 1, &histSize, &histRange, uniform, accumulate);

	int hist_w = 512; int hist_h = 400;
	int bin_w = cvRound((double)hist_w / histSize);

	Mat histImage(hist_h, hist_w, CV_8UC3, Scalar(0, 0, 0));
	return hist;
}
void OLBP(const Mat& src, Mat& dst) {
	switch (src.type()) {
	case CV_8SC1: OLBP_<char>(src, dst); break;
	case CV_8UC1: OLBP_<unsigned char>(src, dst); break;
	case CV_16SC1: OLBP_<short>(src, dst); break;
	case CV_16UC1: OLBP_<unsigned short>(src, dst); break;
	case CV_32SC1: OLBP_<int>(src, dst); break;
	case CV_32FC1: OLBP_<float>(src, dst); break;
	case CV_64FC1: OLBP_<double>(src, dst); break;
	}
}


int main(int argc, const char* argv[]) {

	if (strcmp(argv[1], "-d") == 0) { //if dataset path
		String path = argv[2];
		String folders[2] = { "training", "testing" };

		for (int i = 0; i < 2; i++) {
			vector<cv::String> fn;
			printf("Creating %s files \n", folders[i]);
			String concat = path + folders[i] + "/*.png";
			glob(concat, fn, true);

			vector<Mat> hists; // Vector of histograms
			size_t count = fn.size(); //number of png files in images folder

			//Reads the input folder, extracts lbp feature and puts to histogram vector.
			String labelFile = folders[i] + "_labels.txt";
			String histogramFile = folders[i] + "_hists.txt";
			ofstream flabel(labelFile);
			for (size_t j = 0; j < count; j++) {

				Mat img, lbp, hist;
				img = imread(fn[j]);
				if (fn[j].find("Live") != std::string::npos) {
					flabel << "Live" << endl;
				}
				else {
					flabel << "Fake" << endl;
				}
				cvtColor(img, img, COLOR_BGR2GRAY);
				OLBP(img, lbp);
				hist = histogram(lbp);
				hists.push_back(hist);
			}
			Mat data;
			data = asRowMatrix(hists, CV_32F, 1, 0);
			ofstream fout(histogramFile);
			fout << data << endl;
		}
	}
	else if(strcmp(argv[1], "-i") == 0){ // if image path
		String path = argv[2];
		printf("Creating input image histogram file \n");
		Mat img, lbp,hist;
		vector<Mat> hists;
		img = imread(path);
		cvtColor(img, img, COLOR_BGR2GRAY);
		OLBP(img, lbp);
		hist = histogram(lbp);
		hists.push_back(hist);
		Mat data;
		data = asRowMatrix(hists, CV_32F, 1, 0);
		String histogramFile = "hist.txt";//findFileName(path+".txt");
		ofstream fout(histogramFile);
		fout << data << endl;
		printf("Created hist file! \n");
	}else {
		printf("Inputs are as not expected");
	}
	return 0; // success
}
