using System;
using System.ComponentModel.DataAnnotations;
using System.Net;

namespace blog.Models
{
    public class PublishedPost
    {
        public int Id { get; set; }
        [Required]
        public string PostTitle { get; set; }
        public string PostFirstLine { get; set; }
        [Required]
        public string PostContent { get; set; }
        public string PostAuthor { get; set; }
        [Required]
        public string PostCategory { get; set; }
        [Required]
        public bool IsDraft { get; set; }
        public DateTime PublishedTime { get; set; }
        public DateTime ModifiedTime { get; set; }
        public string DisplayDate { get; set; }

        public string DisplayPublishedTime
        {
            get
            {
                return ConvertToLocalTime(PublishedTime, "long");
            }
        }

        public string DisplayModifiedTime
        {
            get
            {
                return ConvertToLocalTime(ModifiedTime, "long");
            }
        }

        public string DisplayReadableDate
        {
            get
            {
                return ConvertToLocalTime(ModifiedTime, "readable");
            }
        }

        public string ConvertToLocalTime(DateTime inputDateTime, string timeFormat)
        {
            // for Windows system, it is "China Standard Time"
            // for Linux system, it is "Asia/Shanghai"
            string serverName = Dns.GetHostName();
            TimeZoneInfo cst;
            if (serverName == "iZj6c9eo3a9tucucx44vz3Z")
            {
                cst = TimeZoneInfo.FindSystemTimeZoneById("Asia/Shanghai");
            }
            else
            {
                cst = TimeZoneInfo.FindSystemTimeZoneById("China Standard Time");
            }

            string targetTime = timeFormat switch
            {
                "long" => TimeZoneInfo.ConvertTime(inputDateTime, cst).ToString("yyyy-MM-dd HH:mm:ss"),
                "short" => TimeZoneInfo.ConvertTime(inputDateTime, cst).ToString("yyyy-MM"),
                "readable" => TimeZoneInfo.ConvertTime(inputDateTime, cst).ToString("MM dd, yyyy"),
                _ => TimeZoneInfo.ConvertTime(inputDateTime, cst).ToString(),
            };
            return targetTime;
        }
    }
}
